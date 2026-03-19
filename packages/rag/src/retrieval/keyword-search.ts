import { sql } from 'drizzle-orm';
import { db, logger } from '@workspace/db';
import type { KeywordSearchRow } from './types.js';

export async function keywordSearch(
  query: string,
  workspaceId: string,
  topK = 10,
): Promise<KeywordSearchRow[]> {
  logger.debug({ workspaceId, topK }, 'Running keyword search');

  const rows = await db.execute<{
    id: string;
    document_id: string;
    content: string;
    chunk_index: number;
    metadata: Record<string, unknown>;
    created_at: Date;
    keyword_score: number;
    source: string;
  }>(sql`
    SELECT
      c.id,
      c.document_id,
      c.content,
      c.chunk_index,
      c.metadata,
      c.created_at,
      ts_rank(to_tsvector('english', c.content), plainto_tsquery('english', ${query})) AS keyword_score,
      d.title AS source
    FROM chunks c
    JOIN documents d ON d.id = c.document_id
    WHERE d.workspace_id = ${workspaceId}
      AND d.status = 'complete'
      AND to_tsvector('english', c.content) @@ plainto_tsquery('english', ${query})
    ORDER BY keyword_score DESC
    LIMIT ${topK}
  `);

  const rawRows = rows as unknown as {
    id: string;
    document_id: string;
    content: string;
    chunk_index: number;
    metadata: Record<string, unknown>;
    created_at: Date;
    keyword_score: number;
    source: string;
  }[];

  if (rawRows.length === 0) return [];

  const maxScore = Math.max(...rawRows.map((r) => Number(r.keyword_score)));

  return rawRows.map((r) => ({
    id: r.id,
    documentId: r.document_id,
    content: r.content,
    chunkIndex: r.chunk_index,
    metadata: r.metadata,
    createdAt: new Date(r.created_at),
    keywordScore: maxScore > 0 ? Number(r.keyword_score) / maxScore : 0,
    source: r.source,
  }));
}
