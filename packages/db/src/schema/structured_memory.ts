import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces.js';

export const structuredMemory = pgTable('structured_memory', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  value: jsonb('value').notNull(),
  category: text('category').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type StructuredMemory = typeof structuredMemory.$inferSelect;
export type NewStructuredMemory = typeof structuredMemory.$inferInsert;
