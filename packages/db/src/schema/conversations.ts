import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces.js';
import { user } from './auth.js';

export type ConversationMode = 'rag' | 'chat';

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('New conversation'),
  mode: text('mode').notNull().default('rag').$type<ConversationMode>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
