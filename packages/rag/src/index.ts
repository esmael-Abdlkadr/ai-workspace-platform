export { ingest } from './pipeline.js';
export { loadDocument, loadPdf, loadText, loadUrl } from './loaders/index.js';
export { chunkDocument } from './chunker.js';
export { embedTexts, embedQuery } from './embedding.js';
export { retrieve } from './retrieval-pipeline.js';
export {
  semanticSearch,
  keywordSearch,
  hybridSearch,
  rerank,
  assembleContext,
} from './retrieval/index.js';

export type { IngestionInput, IngestionResult, LoadedDocument, RawChunk } from './types.js';
export type { RetrievedChunk, RetrievalResult } from './retrieval/types.js';
export { rewriteQuery, buildChatMessages, generateConversationTitle } from './chat.js';
