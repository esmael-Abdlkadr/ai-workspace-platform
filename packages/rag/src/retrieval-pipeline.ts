import { logger } from '@workspace/db';
import { semanticSearch } from './retrieval/semantic-search.js';
import { keywordSearch } from './retrieval/keyword-search.js';
import { hybridSearch } from './retrieval/hybrid-search.js';
import { rerank } from './retrieval/reranker.js';
import { assembleContext } from './retrieval/context-assembler.js';
import type { RetrievalResult } from './retrieval/types.js';

export async function retrieve(
  query: string,
  workspaceId: string,
  topK = 5,
  minSemanticScore = 0.2,
): Promise<RetrievalResult> {
  logger.info({ workspaceId, topK }, 'Retrieval started');

  const [semanticResults, keywordResults] = await Promise.all([
    semanticSearch(query, workspaceId, 10, minSemanticScore),
    keywordSearch(query, workspaceId),
  ]);

  logger.debug(
    { semanticCount: semanticResults.length, keywordCount: keywordResults.length },
    'Search results fetched',
  );

  const merged = hybridSearch(semanticResults, keywordResults);

  logger.debug({ mergedCount: merged.length }, 'Hybrid fusion complete');

  const reranked = rerank(merged, topK);

  logger.info(
    {
      topResults: reranked.map((c) => ({
        id: c.id,
        source: c.source,
        semanticScore: c.semanticScore.toFixed(4),
        keywordScore: c.keywordScore.toFixed(4),
        finalScore: c.finalScore.toFixed(4),
      })),
    },
    'Reranking complete',
  );

  return assembleContext(reranked);
}

export type { RetrievalResult };
