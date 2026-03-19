import { readFile } from 'fs/promises';
import { PDFParse } from 'pdf-parse';
import type { LoadedDocument } from '../types.js';

export async function loadPdf(filePath: string): Promise<LoadedDocument> {
  const buffer = await readFile(filePath);
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  await parser.destroy();

  return {
    text: result.text.trim(),
    metadata: {
      source: filePath,
      title: filePath.split('/').pop() ?? filePath,
    },
  };
}
