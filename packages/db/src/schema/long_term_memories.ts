import { pgTable, uuid, text, real, timestamp, index } from 'drizzle-orm/pg-core';
import { vector } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces.js';

export const longTermMemories = pgTable(
  'long_term_memories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }),
    importanceScore: real('importance_score').default(0.5).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    embeddingIdx: index('long_term_memories_embedding_idx').using(
      'ivfflat',
      table.embedding.op('vector_cosine_ops'),
    ),
  }),
);

export type LongTermMemory = typeof longTermMemories.$inferSelect;
export type NewLongTermMemory = typeof longTermMemories.$inferInsert;
