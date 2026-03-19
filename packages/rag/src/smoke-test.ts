import { db, chunks, logger } from '@workspace/db';
import { eq } from 'drizzle-orm';
import { ingest } from './pipeline.js';

async function run(): Promise<void> {
  logger.info('Starting Phase 2 smoke test...');

  const workspaceId = process.env['TEST_WORKSPACE_ID'];
  if (!workspaceId) throw new Error('TEST_WORKSPACE_ID env var required');

  const result = await ingest({
    type: 'text',
    content: `LangGraph is a library for building stateful, multi-actor applications with LLMs.
It extends LangChain with the ability to coordinate multiple chains or agents in a cyclic graph.
Each node in the graph can be an LLM call, a tool invocation, or any arbitrary function.
Edges define the flow of data between nodes, with support for conditional branching.
LangGraph supports checkpointing, which enables human-in-the-loop workflows and fault tolerance.
The state object is shared across all nodes and updated incrementally after each step.
This makes LangGraph ideal for building complex agent systems that require memory and persistence.`,
    title: 'LangGraph Overview',
    workspaceId,
  });

  logger.info({ result }, 'Ingestion result');

  if (result.status !== 'complete') {
    throw new Error(`Expected status=complete, got status=${result.status}`);
  }

  const storedChunks = await db
    .select()
    .from(chunks)
    .where(eq(chunks.documentId, result.documentId));

  if (storedChunks.length === 0) throw new Error('No chunks found in DB');

  const firstChunk = storedChunks[0];
  if (!firstChunk?.embedding) throw new Error('Embedding is null');
  if (!Array.isArray(firstChunk.embedding)) throw new Error('Embedding is not an array');
  if (firstChunk.embedding.length !== 768) {
    throw new Error(`Expected 768 dims, got ${firstChunk.embedding.length}`);
  }

  logger.info(
    {
      documentId: result.documentId,
      chunkCount: storedChunks.length,
      embeddingDims: firstChunk.embedding.length,
    },
    'Phase 2 smoke test PASSED',
  );

  await db.$client.end();
}

run().catch((err) => {
  logger.error({ err }, 'Smoke test FAILED');
  process.exit(1);
});
