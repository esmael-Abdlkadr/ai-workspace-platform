import { db, logger, getTask } from '@workspace/db';
import { WorkflowRunner } from './workflow/index.js';

const TASK = 'Explain the key concepts of RAG pipeline architecture';

async function run(): Promise<void> {
  const workspaceId = process.env['TEST_WORKSPACE_ID'];
  if (!workspaceId) throw new Error('TEST_WORKSPACE_ID env var required');

  logger.info({ task: TASK }, 'Starting Phase 5 workflow smoke test...');

  const runner = new WorkflowRunner();
  const task = await runner.run(TASK, workspaceId);

  logger.info(
    {
      taskId: task.id,
      status: task.status,
      resultLength: task.result?.length ?? 0,
      errorMessage: task.errorMessage,
    },
    'WorkflowRunner returned',
  );

  if (task.status !== 'complete') {
    throw new Error(`Expected task status=complete, got "${task.status}": ${task.errorMessage}`);
  }

  if (!task.result) throw new Error('Task result is null — finalDocument was not set');

  if (!task.result.includes('#')) {
    throw new Error('Task result does not appear to be markdown (no # heading found)');
  }

  const dbTask = await getTask(task.id);
  if (!dbTask) throw new Error(`Task ${task.id} not found in DB`);
  if (dbTask.status !== 'complete') throw new Error(`DB task status mismatch: ${dbTask.status}`);

  logger.info(
    {
      taskId: task.id,
      status: task.status,
      resultPreview: task.result.substring(0, 200),
    },
    'Phase 5 smoke test PASSED — workflow completed successfully',
  );

  await db.$client.end();
}

run().catch((err) => {
  logger.error({ err }, 'Phase 5 workflow smoke test FAILED');
  process.exit(1);
});
