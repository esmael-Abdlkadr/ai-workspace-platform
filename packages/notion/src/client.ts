import { Client, APIResponseError } from '@notionhq/client';

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

export function getNotionClient(): Client {
  const auth = process.env['NOTION_API_KEY'];
  if (!auth) throw new Error('NOTION_API_KEY environment variable is required');
  return new Client({ auth });
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(fn: () => Promise<T>, attempt = 0): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const isRateLimit =
      error instanceof APIResponseError && error.status === 429;

    if (!isRateLimit || attempt >= MAX_RETRIES) throw error;

    const backoff = Math.min(BASE_BACKOFF_MS * Math.pow(2, attempt), 30000);
    await sleep(backoff);
    return withRetry(fn, attempt + 1);
  }
}
