import type { LoadedDocument } from '../types.js';

export function loadText(content: string, title: string): LoadedDocument {
  return {
    text: content.trim(),
    metadata: { source: title, title },
  };
}
