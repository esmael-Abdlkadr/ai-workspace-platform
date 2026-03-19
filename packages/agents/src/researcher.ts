import { logger } from '@workspace/db';
import { retrieve } from '@workspace/rag';
import { callLLM } from './base.js';
import { AgentOutputSchema } from './types.js';
import type { AgentInput, AgentOutput } from './types.js';

const SYSTEM_PROMPT = `You are a research assistant. Given a task and relevant context from a knowledge base, extract and summarize the key findings that directly address the task.

Return a concise, factual summary of the findings. Use bullet points for clarity. Do not add information not present in the context.`;

export async function researcherAgent(input: AgentInput): Promise<AgentOutput> {
  logger.info({ task: input.task, workspaceId: input.workspaceId }, 'ResearcherAgent started');

  const retrieval = await retrieve(input.task, input.workspaceId);

  const contextText =
    retrieval.context.trim().length > 0
      ? retrieval.context
      : 'No relevant documents found in the knowledge base.';

  const output = await callLLM(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'human',
        content: `Task: ${input.task}\n\nKnowledge Base Context:\n${contextText}`,
      },
    ],
    'researcher',
  );

  const result = AgentOutputSchema.parse({
    agentName: 'researcher',
    output,
    confidence: retrieval.chunks.length > 0 ? 8 : 4,
    metadata: {
      sources: retrieval.sources,
      chunkCount: retrieval.chunks.length,
    },
  });

  logger.info({ chunkCount: retrieval.chunks.length }, 'ResearcherAgent complete');
  return result;
}
