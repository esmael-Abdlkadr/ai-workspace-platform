import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { tasks } from './tasks.js';

export const notionReferences = pgTable('notion_references', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  notionPageId: text('notion_page_id').notNull(),
  notionPageUrl: text('notion_page_url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type NotionReference = typeof notionReferences.$inferSelect;
export type NewNotionReference = typeof notionReferences.$inferInsert;
