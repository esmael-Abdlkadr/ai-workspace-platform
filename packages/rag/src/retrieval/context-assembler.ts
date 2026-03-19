import type { RetrievedChunk, RetrievalResult } from './types.js';

export function assembleContext(chunks: RetrievedChunk[]): RetrievalResult {
  const contextBlocks = chunks.map((chunk, i) => {
    return `[${i + 1}] Source: ${chunk.source} (chunk ${chunk.chunkIndex})\n${chunk.content}`;
  });

  const context = contextBlocks.join('\n\n---\n\n');

  const sources = chunks.map((chunk) => ({
    documentId: chunk.documentId,
    title: chunk.source,
    chunkIndex: chunk.chunkIndex,
  }));

  return { context, sources, chunks };
}
