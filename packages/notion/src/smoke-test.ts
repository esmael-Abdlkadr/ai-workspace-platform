import 'dotenv/config';
import {
  createWorkspace,
  createTask,
  getNotionReferenceByTask,
  saveNotionReference,
} from '@workspace/db';
import { NotionPublisher } from './publisher.js';

const TEST_MARKDOWN = `# AI Research Report

## Executive Summary

This is a smoke test document published from the AI Workspace Platform.

## Key Findings

- The Notion write-back pipeline is operational
- Markdown is correctly converted to Notion blocks
- Pages are created in the target database

## Conclusion

Phase 6 is working as expected.
`;

async function main() {
  console.log('Phase 6 smoke test — Notion Write-Back Pipeline');

  const workspace = await createWorkspace({ name: 'Phase 6 Smoke Test Workspace' });
  console.log(`Workspace created: ${workspace.id}`);

  const task = await createTask({ workspaceId: workspace.id, prompt: 'Notion smoke test' });
  console.log(`Task created: ${task.id}`);

  const publisher = new NotionPublisher();
  const { pageId, pageUrl } = await publisher.publish('Phase 6 Smoke Test Report', TEST_MARKDOWN);

  console.log(`Page published: ${pageUrl}`);

  if (!pageId || !pageUrl) throw new Error('publish() must return non-empty pageId and pageUrl');

  await saveNotionReference({ taskId: task.id, notionPageId: pageId, notionPageUrl: pageUrl });
  console.log('Notion reference saved to DB');

  const reference = await getNotionReferenceByTask(task.id);
  if (!reference) throw new Error('notion_references row not found in DB');
  if (reference.notionPageId !== pageId) throw new Error('notionPageId mismatch in DB row');

  console.log('All assertions passed');
  console.log(`Verify page at: ${pageUrl}`);
}

main().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
