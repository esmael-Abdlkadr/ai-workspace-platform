import {
  createDocument,
  updateDocumentStatus,
  insertChunks,
  logger,
  type Document,
} from '@workspace/db';
import { loadDocument } from './loaders/index.js';
import { chunkDocument } from './chunker.js';
import { embedTexts } from './embedding.js';
import type { IngestionInput, IngestionResult } from './types.js';

export async function ingest(input: IngestionInput): Promise<IngestionResult> {
  const document = await createDocument({
    workspaceId: input.workspaceId,
    title: input.title,
    sourceType: input.type,
    sourceUrl: input.type === 'url' ? input.url : input.type === 'pdf' ? input.filePath : null,
    status: 'pending',
  });

  logger.info({ documentId: document.id, type: input.type }, 'Ingestion started');

  try {
    await updateDocumentStatus(document.id, 'processing');

    const loaded = await loadDocument(input);
    logger.debug({ documentId: document.id, textLength: loaded.text.length }, 'Document loaded');

    const rawChunks = await chunkDocument(loaded);
    logger.debug({ documentId: document.id, chunkCount: rawChunks.length }, 'Document chunked');

    if (rawChunks.length === 0) {
      throw new Error('Document produced zero chunks after filtering');
    }

    const embeddings = await embedTexts(rawChunks.map((c) => c.content));
    logger.debug({ documentId: document.id }, 'Embeddings generated');

    const newChunks = rawChunks.map((chunk, i) => ({
      documentId: document.id,
      content: chunk.content,
      embedding: embeddings[i] ?? [],
      chunkIndex: chunk.chunkIndex,
      metadata: chunk.metadata,
    }));

    await insertChunks(newChunks);
    await updateDocumentStatus(document.id, 'complete');

    logger.info(
      { documentId: document.id, chunkCount: newChunks.length },
      'Ingestion complete',
    );

    return { documentId: document.id, chunkCount: newChunks.length, status: 'complete' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ error, documentId: document.id }, 'Ingestion failed');
    await updateDocumentStatus(document.id, 'error', message);
    return { documentId: document.id, chunkCount: 0, status: 'error' };
  }
}

export type { IngestionInput, IngestionResult };
export type { Document };
