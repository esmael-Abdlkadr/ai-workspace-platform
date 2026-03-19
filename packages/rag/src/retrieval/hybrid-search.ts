import type { SemanticSearchRow, KeywordSearchRow, RetrievedChunk } from './types.js';

const RRF_K = 60;

export function hybridSearch(
  semanticResults: SemanticSearchRow[],
  keywordResults: KeywordSearchRow[],
): RetrievedChunk[] {
  const map = new Map<string, RetrievedChunk>();

  semanticResults.forEach((row, rank) => {
    const rrfScore = 1 / (RRF_K + rank + 1);
    map.set(row.id, {
      id: row.id,
      documentId: row.documentId,
      content: row.content,
      chunkIndex: row.chunkIndex,
      metadata: row.metadata,
      createdAt: row.createdAt,
      semanticScore: row.semanticScore,
      keywordScore: 0,
      rrfScore,
      finalScore: 0,
      source: row.source,
    });
  });

  keywordResults.forEach((row, rank) => {
    const rrfScore = 1 / (RRF_K + rank + 1);
    const existing = map.get(row.id);
    if (existing) {
      existing.keywordScore = row.keywordScore;
      existing.rrfScore += rrfScore;
    } else {
      map.set(row.id, {
        id: row.id,
        documentId: row.documentId,
        content: row.content,
        chunkIndex: row.chunkIndex,
        metadata: row.metadata,
        createdAt: row.createdAt,
        semanticScore: 0,
        keywordScore: row.keywordScore,
        rrfScore,
        finalScore: 0,
        source: row.source,
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => b.rrfScore - a.rrfScore);
}
