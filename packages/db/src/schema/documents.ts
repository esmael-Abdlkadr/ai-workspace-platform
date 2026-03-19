import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces.js';

export const documentSourceTypeEnum = pgEnum('document_source_type', [
  'pdf',
  'text',
  'url',
  'notion',
]);

export const documentStatusEnum = pgEnum('document_status', [
  'pending',
  'processing',
  'complete',
  'error',
]);

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  sourceUrl: text('source_url'),
  sourceType: documentSourceTypeEnum('source_type').notNull(),
  status: documentStatusEnum('status').default('pending').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
