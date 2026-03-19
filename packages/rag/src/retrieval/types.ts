export type RetrievedChunk = {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  semanticScore: number;
  keywordScore: number;
  rrfScore: number;
  finalScore: number;
  source: string;
};

export type RetrievalResult = {
  context: string;
  sources: { documentId: string; title: string; chunkIndex: number }[];
  chunks: RetrievedChunk[];
};

export type SemanticSearchRow = {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  semanticScore: number;
  source: string;
};

export type KeywordSearchRow = {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  keywordScore: number;
  source: string;
};
