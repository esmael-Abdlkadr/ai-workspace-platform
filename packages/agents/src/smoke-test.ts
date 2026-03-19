import { db, logger } from '@workspace/db';
import { researcherAgent } from './researcher.js';
import { writerAgent } from './writer.js';
import { criticAgent } from './critic.js';
import { memoryAgent } from './memory.js';
import { AgentOutputSchema } from './types.js';

const TASK = 'Explain how LangGraph manages state in multi-agent systems';

async function run(): Promise<void> {
  const workspaceId = process.env['TEST_WORKSPACE_ID'];
  if (!workspaceId) throw new Error('TEST_WORKSPACE_ID env var required');

  logger.info('Starting Phase 4 smoke test...');

  logger.info('Step 1: ResearcherAgent');
  const researchResult = await researcherAgent({ task: TASK, workspaceId });
  AgentOutputSchema.parse(researchResult);
  if (!researchResult.output.trim()) throw new Error('Researcher output is empty');
  logger.info({ outputLength: researchResult.output.length, confidence: researchResult.confidence }, 'Researcher PASSED');

  logger.info('Step 2: WriterAgent');
  const writeResult = await writerAgent({
    task: TASK,
    workspaceId,
    context: researchResult.output,
  });
  AgentOutputSchema.parse(writeResult);
  if (!writeResult.output.includes('#')) throw new Error('Writer output has no markdown heading');
  logger.info({ outputLength: writeResult.output.length, confidence: writeResult.confidence }, 'Writer PASSED');

  logger.info('Step 3: CriticAgent');
  const criticResult = await criticAgent({
    task: TASK,
    workspaceId,
    context: writeResult.output,
  });
  AgentOutputSchema.parse(criticResult);
  const score = criticResult.confidence;
  if (score < 0 || score > 10) throw new Error(`Critic score ${score} out of range`);
  const feedback = (criticResult.metadata?.['feedback'] as string) ?? '';
  if (!feedback.trim()) throw new Error('Critic feedback is empty');
  logger.info({ score, feedbackLength: feedback.length }, 'Critic PASSED');

  logger.info('Step 4: MemoryAgent');
  const memoryResult = await memoryAgent({
    task: TASK,
    workspaceId,
    context: writeResult.output,
  });
  AgentOutputSchema.parse(memoryResult);
  if (!memoryResult.output.includes('long-term memory')) throw new Error('Memory agent output unexpected');
  logger.info({ output: memoryResult.output }, 'Memory PASSED');

  logger.info(
    {
      researcher: { outputLength: researchResult.output.length, confidence: researchResult.confidence },
      writer: { outputLength: writeResult.output.length },
      critic: { score, feedback: feedback.substring(0, 100) },
      memory: { output: memoryResult.output },
    },
    'Phase 4 smoke test PASSED — all 4 agents succeeded',
  );

  await db.$client.end();
}

run().catch((err) => {
  logger.error({ err }, 'Phase 4 smoke test FAILED');
  process.exit(1);
});
