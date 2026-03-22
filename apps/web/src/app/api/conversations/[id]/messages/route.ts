import { z } from 'zod';
import { headers } from 'next/headers';
import Groq from 'groq-sdk';
import { auth } from '@/lib/auth';
import {
  getConversationByIdAndUser,
  listMessages,
  createMessage,
  updateConversationTitle,
  touchConversation,
} from '@workspace/db';
import { retrieve, rewriteQuery, buildChatMessages, generateConversationTitle } from '@workspace/rag';
import { ok, unauthorized, forbidden, serverError } from '@/lib/api-response';

export const maxDuration = 300;

const SendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
});

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is required');
  return new Groq({ apiKey });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return unauthorized();

    const { id } = await params;
    const conversation = await getConversationByIdAndUser(id, session.user.id);
    if (!conversation) return forbidden('Conversation not found or access denied');

    const msgs = await listMessages(id);
    return ok({ messages: msgs });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Failed to load messages');
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return unauthorized();

    const { id } = await params;
    const conversation = await getConversationByIdAndUser(id, session.user.id);
    if (!conversation) return forbidden('Conversation not found or access denied');

    let body: unknown;
    try { body = await request.json(); } catch {
      return serverError('Invalid JSON');
    }

    const parsed = SendMessageSchema.safeParse(body);
    if (!parsed.success) return serverError('Validation failed');

    const userContent = parsed.data.content;

    await createMessage({ conversationId: id, role: 'user', content: userContent });

    const history = await listMessages(id, 20);
    const historyForContext = history
      .slice(0, -1)
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    if (!conversation.workspaceId) return forbidden('RAG chat requires a workspace');

    const rewrittenQuery = await rewriteQuery(userContent, historyForContext);
    const retrieval = await retrieve(rewrittenQuery, conversation.workspaceId, 6);
    const chatMessages = buildChatMessages(userContent, retrieval.chunks, historyForContext);

    const groq = getGroqClient();
    const model = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

    const completion = await groq.chat.completions.create({
      model,
      messages: chatMessages as Groq.Chat.ChatCompletionMessageParam[],
      temperature: 0.3,
      max_tokens: 1500,
      stream: false,
    });

    const content = completion.choices[0]?.message?.content ?? '';

    const sources = retrieval.chunks.map((c) => ({
      documentTitle: c.source,
      chunkText: c.content.slice(0, 200),
      source: c.source,
      score: c.finalScore,
    }));

    const assistantMessage = await createMessage({
      conversationId: id,
      role: 'assistant',
      content,
      sources,
    });

    await touchConversation(id);

    const isFirstExchange = historyForContext.length === 0;
    if (isFirstExchange && conversation.title === 'New conversation') {
      generateConversationTitle(userContent)
        .then((title) => updateConversationTitle(id, title))
        .catch(() => undefined);
    }

    return ok({ message: assistantMessage, sources });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Failed to process message');
  }
}
