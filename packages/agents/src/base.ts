import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { logger } from '@workspace/db';

export type LLMMessage = { role: 'system' | 'human'; content: string };

function getGroqClient(): ChatGroq {
  const apiKey = process.env['GROQ_API_KEY'];
  const model = process.env['GROQ_MODEL'] ?? 'llama-3.3-70b-versatile';

  if (!apiKey) throw new Error('GROQ_API_KEY environment variable is required');

  return new ChatGroq({ apiKey, model, temperature: 0.3 });
}

export async function callLLM(messages: LLMMessage[], agentName: string): Promise<string> {
  const client = getGroqClient();

  const langchainMessages = messages.map((m) =>
    m.role === 'system' ? new SystemMessage(m.content) : new HumanMessage(m.content),
  );

  logger.info({ agentName, messageCount: messages.length }, 'LLM call started');

  const response = await client.invoke(langchainMessages);

  const content = typeof response.content === 'string' ? response.content : '';

  if (!content.trim()) throw new Error(`${agentName}: LLM returned empty response`);

  const usage = response.usage_metadata as
    | { input_tokens?: number; output_tokens?: number }
    | undefined;
  logger.info(
    {
      agentName,
      inputTokens: usage?.input_tokens,
      outputTokens: usage?.output_tokens,
    },
    'LLM call complete',
  );

  return content;
}
