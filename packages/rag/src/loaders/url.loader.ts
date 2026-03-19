import * as cheerio from 'cheerio';
import type { LoadedDocument } from '../types.js';

export async function loadUrl(url: string): Promise<LoadedDocument> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AI-Workspace-Bot/1.0)' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL ${url}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  $('script, style, nav, footer, header, aside, iframe, noscript').remove();

  const title = $('title').text().trim() || $('h1').first().text().trim() || url;
  const text = $('body').text().replace(/\s+/g, ' ').trim();

  return {
    text,
    metadata: { source: url, title },
  };
}
