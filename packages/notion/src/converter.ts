import type { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints.js';

type RichText = {
  type: 'text';
  text: { content: string };
};

function richText(content: string): RichText[] {
  return [{ type: 'text', text: { content: content.trim() } }];
}

function heading1Block(text: string): BlockObjectRequest {
  return { type: 'heading_1', heading_1: { rich_text: richText(text) } };
}

function heading2Block(text: string): BlockObjectRequest {
  return { type: 'heading_2', heading_2: { rich_text: richText(text) } };
}

function heading3Block(text: string): BlockObjectRequest {
  return { type: 'heading_3', heading_3: { rich_text: richText(text) } };
}

function bulletBlock(text: string): BlockObjectRequest {
  return { type: 'bulleted_list_item', bulleted_list_item: { rich_text: richText(text) } };
}

function paragraphBlock(text: string): BlockObjectRequest {
  return { type: 'paragraph', paragraph: { rich_text: richText(text) } };
}

export function markdownToNotionBlocks(markdown: string): BlockObjectRequest[] {
  const lines = markdown.split('\n');
  const blocks: BlockObjectRequest[] = [];

  for (const line of lines) {
    if (line.startsWith('### ')) {
      blocks.push(heading3Block(line.slice(4)));
    } else if (line.startsWith('## ')) {
      blocks.push(heading2Block(line.slice(3)));
    } else if (line.startsWith('# ')) {
      blocks.push(heading1Block(line.slice(2)));
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push(bulletBlock(line.slice(2)));
    } else if (line.trim() === '') {
      blocks.push(paragraphBlock(' '));
    } else {
      blocks.push(paragraphBlock(line));
    }
  }

  return blocks;
}
