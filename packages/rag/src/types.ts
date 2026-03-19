export type LoadedDocument = {
  text: string;
  metadata: {
    source: string;
    title: string;
    pageCount?: number;
  };
};

export type RawChunk = {
  content: string;
  chunkIndex: number;
  metadata: {
    source: string;
    createdAt: string;
  };
};

export type IngestionInput = {
  workspaceId: string;
  title: string;
} & (
  | { type: 'pdf'; filePath: string }
  | { type: 'text'; content: string }
  | { type: 'url'; url: string }
);

export type IngestionResult = {
  documentId: string;
  chunkCount: number;
  status: 'complete' | 'error';
};
