import OpenAI from 'openai';
import { logger } from '@workspace/db';
import type { RetrievedChunk } from './retrieval/types.js';

type ChatHistoryMessage = { role: 'user' | 'assistant'; content: string };

function getGroqClient(): OpenAI {
  const apiKey = process.env['GROQ_API_KEY'];
  if (!apiKey) throw new Error('GROQ_API_KEY is required');
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });
}

const GROQ_MODEL = () => process.env['GROQ_MODEL'] ?? 'llama-3.3-70b-versatile';

export async function rewriteQuery(
  userMessage: string,
  history: ChatHistoryMessage[],
): Promise<string> {
  if (history.length === 0) return userMessage;

  const historyText = history
    .slice(-6)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const client = getGroqClient();

  const response = await client.chat.completions.create({
    model: GROQ_MODEL(),
    temperature: 0,
    max_tokens: 120,
    messages: [
      {
        role: 'system',
        content:
          'You are a search query optimizer. Given a conversation history and a new user message, rewrite the user message into a standalone, self-contained search query that captures the full intent — even if the message uses pronouns or references previous context. Return ONLY the rewritten query, nothing else.',
      },
      {
        role: 'user',
        content: `Conversation history:\n${historyText}\n\nNew message: ${userMessage}\n\nRewritten query:`,
      },
    ],
  });

  const rewritten = response.choices[0]?.message?.content?.trim();

  logger.info(
    { original: userMessage, rewritten },
    'Query rewritten for RAG retrieval',
  );

  return rewritten && rewritten.length > 0 ? rewritten : userMessage;
}

export function buildChatMessages(
  userMessage: string,
  chunks: RetrievedChunk[],
  history: ChatHistoryMessage[],
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const hasContext = chunks.length > 0;

  const contextBlock = hasContext
    ? chunks
        .map((c, i) => `[${i + 1}] Source: ${c.source}\n${c.content}`)
        .join('\n\n---\n\n')
    : 'No relevant documents found in the knowledge base.';

  const systemPrompt = `You are a knowledgeable AI assistant with access to the user's workspace knowledge base.

CONTEXT FROM KNOWLEDGE BASE:
${contextBlock}

INSTRUCTIONS:
- Answer based ONLY on the context provided above.
- If the context contains the answer, provide a clear, well-structured response with inline citations using [1], [2], etc.
- If the context does NOT contain enough information to answer, say: "I couldn't find specific information about this in your workspace documents. Consider ingesting more relevant sources."
- Be concise and direct. Use markdown for formatting when helpful.
- Do not make up information or cite sources that aren't in the context.`;

  const historyMessages: OpenAI.Chat.ChatCompletionMessageParam[] = history
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content }));

  return [
    { role: 'system', content: systemPrompt },
    ...historyMessages,
    { role: 'user', content: userMessage },
  ];
}

export function generateTitlePrompt(firstUserMessage: string): OpenAI.Chat.ChatCompletionMessageParam[] {
  return [
    {
      role: 'system',
      content:
        'Generate a short, descriptive title (max 6 words, no quotes) for a conversation that starts with the following message. Return only the title.',
    },
    { role: 'user', content: firstUserMessage },
  ];
}

export async function generateConversationTitle(firstUserMessage: string): Promise<string> {
  const client = getGroqClient();
  const response = await client.chat.completions.create({
    model: GROQ_MODEL(),
    temperature: 0.3,
    max_tokens: 20,
    messages: generateTitlePrompt(firstUserMessage),
  });
  const title = response.choices[0]?.message?.content?.trim() ?? 'New conversation';
  return title.slice(0, 60);
}
