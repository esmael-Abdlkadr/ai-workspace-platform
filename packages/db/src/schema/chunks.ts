import { pgTable, uuid, text, integer, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { vector } from 'drizzle-orm/pg-core';
import { documents } from './documents.js';

export const chunks = pgTable(
  'chunks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 768 }),
    chunkIndex: integer('chunk_index').notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    embeddingIdx: index('chunks_embedding_idx').using(
      'ivfflat',
      table.embedding.op('vector_cosine_ops'),
    ),
  }),
);

export type Chunk = typeof chunks.$inferSelect;
export type NewChunk = typeof chunks.$inferInsert;
