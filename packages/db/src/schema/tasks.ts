import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces.js';

export const taskStatusEnum = pgEnum('task_status', [
  'pending',
  'running',
  'complete',
  'error',
]);

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  status: taskStatusEnum('status').default('pending').notNull(),
  result: text('result'),
  langgraphRunId: text('langgraph_run_id'),
  notionPageUrl: text('notion_page_url'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
