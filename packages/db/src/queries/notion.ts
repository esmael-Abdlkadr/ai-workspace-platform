import { eq } from 'drizzle-orm';
import { db } from '../db.js';
import {
  notionReferences,
  type NewNotionReference,
  type NotionReference,
} from '../schema/notion_references.js';

export async function saveNotionReference(input: NewNotionReference): Promise<NotionReference> {
  const [reference] = await db.insert(notionReferences).values(input).returning();
  if (!reference) throw new Error('Failed to save Notion reference');
  return reference;
}

export async function getNotionReferenceByTask(taskId: string): Promise<NotionReference | null> {
  const [reference] = await db
    .select()
    .from(notionReferences)
    .where(eq(notionReferences.taskId, taskId))
    .limit(1);
  return reference ?? null;
}
