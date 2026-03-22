import { readFile } from 'fs/promises';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse/lib/pdf-parse.js') as (
  dataBuffer: Buffer,
  options?: Record<string, unknown>,
) => Promise<{ text: string; numpages: number }>;
import type { LoadedDocument } from '../types.js';

export async function loadPdf(filePath: string): Promise<LoadedDocument> {
  const buffer = await readFile(filePath);
  const data = await pdfParse(buffer);

  if (!data.text.trim()) {
    throw new Error('PDF produced zero text — file may be scanned/image-only or encrypted');
  }

  return {
    text: data.text.trim(),
    metadata: {
      source: filePath,
      title: filePath.split('/').pop() ?? filePath,
    },
  };
}
