import { loadPdf } from './pdf.loader.js';
import { loadText } from './text.loader.js';
import { loadUrl } from './url.loader.js';
import type { IngestionInput, LoadedDocument } from '../types.js';

export async function loadDocument(input: IngestionInput): Promise<LoadedDocument> {
  switch (input.type) {
    case 'pdf':
      return loadPdf(input.filePath);
    case 'text':
      return loadText(input.content, input.title);
    case 'url':
      return loadUrl(input.url);
  }
}

export { loadPdf, loadText, loadUrl };
