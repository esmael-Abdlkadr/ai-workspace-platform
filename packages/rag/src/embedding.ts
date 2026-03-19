import { OllamaEmbeddings } from '@langchain/ollama';
import { logger } from '@workspace/db';

const BATCH_SIZE = 10;
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

function getEmbeddingClient(): OllamaEmbeddings {
  const baseUrl = process.env['OLLAMA_BASE_URL'] ?? 'http://localhost:11434';
  const model = process.env['OLLAMA_EMBEDDING_MODEL'] ?? 'nomic-embed-text';

  return new OllamaEmbeddings({ baseUrl, model });
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function embedBatchWithRetry(
  client: OllamaEmbeddings,
  texts: string[],
  attempt = 0,
): Promise<number[][]> {
  try {
    return await client.embedDocuments(texts);
  } catch (error) {
    if (attempt >= MAX_RETRIES) {
      logger.error({ error, attempt }, 'Embedding failed after max retries');
      throw error;
    }
    const backoff = Math.min(BASE_BACKOFF_MS * Math.pow(2, attempt), 60000);
    logger.warn({ attempt, backoffMs: backoff }, 'Embedding failed, retrying');
    await sleep(backoff);
    return embedBatchWithRetry(client, texts, attempt + 1);
  }
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const client = getEmbeddingClient();
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    logger.debug({ batchStart: i, batchSize: batch.length }, 'Embedding batch');
    const embeddings = await embedBatchWithRetry(client, batch);
    results.push(...embeddings);
  }

  return results;
}

export async function embedQuery(text: string): Promise<number[]> {
  const client = getEmbeddingClient();
  return client.embedQuery(text);
}
