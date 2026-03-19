import { logger, saveLongTermMemory, saveStructuredMemory } from '@workspace/db';
import { embedTexts } from '@workspace/rag';
import { AgentOutputSchema } from './types.js';
import type { AgentInput, AgentOutput } from './types.js';

export async function memoryAgent(input: AgentInput): Promise<AgentOutput> {
  logger.info({ task: input.task, workspaceId: input.workspaceId }, 'MemoryAgent started');

  if (!input.context) throw new Error('MemoryAgent requires context (document to memorize)');

  const summary = input.context.substring(0, 1000);

  const [embedding] = await embedTexts([summary]);
  if (!embedding) throw new Error('MemoryAgent: embedding generation failed');

  const longTermMemory = await saveLongTermMemory({
    workspaceId: input.workspaceId,
    content: summary,
    embedding,
    importanceScore: 0.8,
  });

  await saveStructuredMemory({
    workspaceId: input.workspaceId,
    key: `task:${Date.now()}`,
    value: { task: input.task, summary, documentLength: input.context.length },
    category: 'completed_tasks',
  });

  const result = AgentOutputSchema.parse({
    agentName: 'memory',
    output: `Saved to long-term memory (id: ${longTermMemory.id}) and structured memory.`,
    confidence: 9,
    metadata: {
      longTermMemoryId: longTermMemory.id,
      summaryLength: summary.length,
    },
  });

  logger.info({ longTermMemoryId: longTermMemory.id }, 'MemoryAgent complete');
  return result;
}
