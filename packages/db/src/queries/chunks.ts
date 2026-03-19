import { eq, sql } from 'drizzle-orm';
import { db } from '../db.js';
import { chunks, type NewChunk, type Chunk } from '../schema/chunks.js';

export async function insertChunks(input: NewChunk[]): Promise<Chunk[]> {
  if (input.length === 0) return [];
  return db.insert(chunks).values(input).returning();
}

export async function deleteChunksByDocument(documentId: string): Promise<void> {
  await db.delete(chunks).where(eq(chunks.documentId, documentId));
}

export type SimilarChunk = Chunk & { similarity: number };

export async function searchChunksBySimilarity(
  embedding: number[],
  options: {
    topK?: number;
    documentId?: string;
  } = {},
): Promise<SimilarChunk[]> {
  const { topK = 10, documentId } = options;
  const embeddingStr = `[${embedding.join(',')}]`;

  const result = await db.execute<Chunk & { similarity: number }>(sql`
    SELECT
      c.*,
      1 - (c.embedding <=> ${embeddingStr}::vector) AS similarity
    FROM chunks c
    ${documentId ? sql`WHERE c.document_id = ${documentId}` : sql``}
    ORDER BY c.embedding <=> ${embeddingStr}::vector
    LIMIT ${topK}
  `);

  return result as unknown as SimilarChunk[];
}
