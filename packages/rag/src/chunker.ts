import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import type { RawChunk, LoadedDocument } from './types.js';

const MIN_CHUNK_LENGTH = 100;

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 64,
  separators: ['\n\n', '\n', '. ', ' ', ''],
});

export async function chunkDocument(doc: LoadedDocument): Promise<RawChunk[]> {
  const rawChunks = await splitter.splitText(doc.text);
  const now = new Date().toISOString();

  return rawChunks
    .filter((content) => content.trim().length >= MIN_CHUNK_LENGTH)
    .map((content, index) => ({
      content: content.trim(),
      chunkIndex: index,
      metadata: {
        source: doc.metadata.source,
        createdAt: now,
      },
    }));
}
