import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { conversations } from './conversations.js';

export type MessageSource = {
  documentTitle: string;
  chunkText: string;
  source: string;
  score: number;
};

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  role: text('role').notNull().$type<'user' | 'assistant'>(),
  content: text('content').notNull(),
  sources: jsonb('sources').$type<MessageSource[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
