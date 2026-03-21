import { logger } from '@workspace/db';
import { getNotionClient, withRetry } from './client.js';
import { markdownToNotionBlocks } from './converter.js';
import type { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints.js';

const BLOCK_BATCH_SIZE = 100;

export type PublishResult = {
  pageId: string;
  pageUrl: string;
};

export class NotionPublisher {
  async publish(title: string, markdown: string): Promise<PublishResult> {
    const client = getNotionClient();
    const databaseId = process.env['NOTION_DEFAULT_DATABASE_ID'];
    if (!databaseId) throw new Error('NOTION_DEFAULT_DATABASE_ID environment variable is required');

    logger.info({ title, databaseId }, 'NotionPublisher: creating page');

    const page = await withRetry(() =>
      client.pages.create({
        parent: { type: 'database_id', database_id: databaseId },
        properties: {
          Name: {
            title: [{ type: 'text', text: { content: title } }],
          },
        },
      }),
    );

    const pageId = page.id;
    logger.info({ pageId }, 'NotionPublisher: page created');

    const blocks = markdownToNotionBlocks(markdown);

    for (let i = 0; i < blocks.length; i += BLOCK_BATCH_SIZE) {
      const batch = blocks.slice(i, i + BLOCK_BATCH_SIZE) as BlockObjectRequest[];
      await withRetry(() =>
        client.blocks.children.append({
          block_id: pageId,
          children: batch,
        }),
      );
      logger.debug({ batchStart: i, batchSize: batch.length }, 'NotionPublisher: blocks appended');
    }

    const pageUrl = `https://www.notion.so/${pageId.replace(/-/g, '')}`;
    logger.info({ pageId, pageUrl }, 'NotionPublisher: publish complete');

    return { pageId, pageUrl };
  }
}
