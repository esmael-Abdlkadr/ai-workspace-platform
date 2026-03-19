import { db } from './db.js';
import { createWorkspace, getWorkspace, deleteWorkspace } from './queries/workspaces.js';
import { logger } from './logger.js';

async function run(): Promise<void> {
  logger.info('Starting Phase 1 smoke test...');

  const workspace = await createWorkspace({ name: 'Test Workspace' });
  logger.info({ id: workspace.id, name: workspace.name }, 'Created workspace');

  const fetched = await getWorkspace(workspace.id);
  if (!fetched) throw new Error('Workspace not found after insert');
  logger.info({ id: fetched.id, name: fetched.name }, 'Retrieved workspace');

  if (fetched.name !== 'Test Workspace') throw new Error('Name mismatch');
  if (!fetched.createdAt) throw new Error('Missing createdAt');

  await deleteWorkspace(workspace.id);
  logger.info('Cleaned up test workspace');

  logger.info('Phase 1 smoke test PASSED');
  await db.$client.end();
}

run().catch((err) => {
  logger.error({ err }, 'Smoke test FAILED');
  process.exit(1);
});
