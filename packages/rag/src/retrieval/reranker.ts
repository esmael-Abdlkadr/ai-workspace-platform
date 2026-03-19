import type { RetrievedChunk } from './types.js';

const SEMANTIC_WEIGHT = 0.6;
const RECENCY_WEIGHT = 0.2;
const QUALITY_WEIGHT = 0.2;
const QUALITY_MIN_LENGTH = 50;
const QUALITY_MAX_LENGTH = 200;
const QUALITY_MIN_SCORE = 0.2;

function recencyScore(createdAt: Date, minTime: number, maxTime: number): number {
  if (maxTime === minTime) return 1;
  return (createdAt.getTime() - minTime) / (maxTime - minTime);
}

function qualityScore(content: string): number {
  const len = content.trim().length;
  if (len >= QUALITY_MAX_LENGTH) return 1;
  if (len <= QUALITY_MIN_LENGTH) return QUALITY_MIN_SCORE;
  return (
    QUALITY_MIN_SCORE +
    ((len - QUALITY_MIN_LENGTH) / (QUALITY_MAX_LENGTH - QUALITY_MIN_LENGTH)) *
      (1 - QUALITY_MIN_SCORE)
  );
}

export function rerank(chunks: RetrievedChunk[], topK = 5): RetrievedChunk[] {
  if (chunks.length === 0) return [];

  const timestamps = chunks.map((c) => c.createdAt.getTime());
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);

  const scored = chunks.map((chunk) => ({
    ...chunk,
    finalScore:
      SEMANTIC_WEIGHT * chunk.semanticScore +
      RECENCY_WEIGHT * recencyScore(chunk.createdAt, minTime, maxTime) +
      QUALITY_WEIGHT * qualityScore(chunk.content),
  }));

  return scored.sort((a, b) => b.finalScore - a.finalScore).slice(0, topK);
}
