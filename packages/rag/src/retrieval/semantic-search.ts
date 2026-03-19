import { sql } from 'drizzle-orm';
import { db, logger } from '@workspace/db';
import { embedQuery } from '../embedding.js';
import type { SemanticSearchRow } from './types.js';

export async function semanticSearch(
  query: string,
  workspaceId: string,
  topK = 10,
  minScore = 0.2,
): Promise<SemanticSearchRow[]> {
  const vector = await embedQuery(query);
  const embeddingStr = `[${vector.join(',')}]`;

  logger.debug({ workspaceId, topK }, 'Running semantic search');

  const rows = await db.execute<{
    id: string;
    document_id: string;
    content: string;
    chunk_index: number;
    metadata: Record<string, unknown>;
    created_at: Date;
    semantic_score: number;
    source: string;
  }>(sql`
    SELECT
      c.id,
      c.document_id,
      c.content,
      c.chunk_index,
      c.metadata,
      c.created_at,
      1 - (c.embedding <=> ${embeddingStr}::vector) AS semantic_score,
      d.title AS source
    FROM chunks c
    JOIN documents d ON d.id = c.document_id
    WHERE d.workspace_id = ${workspaceId}
      AND d.status = 'complete'
      AND 1 - (c.embedding <=> ${embeddingStr}::vector) >= ${minScore}
    ORDER BY c.embedding <=> ${embeddingStr}::vector
    LIMIT ${topK}
  `);

  return (rows as unknown as typeof rows).map((r) => ({
    id: r.id,
    documentId: r.document_id,
    content: r.content,
    chunkIndex: r.chunk_index,
    metadata: r.metadata,
    createdAt: new Date(r.created_at),
    semanticScore: Number(r.semantic_score),
    source: r.source,
  }));
}
