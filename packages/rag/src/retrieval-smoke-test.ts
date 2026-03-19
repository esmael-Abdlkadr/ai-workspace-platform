import { db, logger } from '@workspace/db';
import { ingest } from './pipeline.js';
import { retrieve } from './retrieval-pipeline.js';

const IRRELEVANT_SEMANTIC_THRESHOLD = 0.5;

async function seedDocuments(workspaceId: string): Promise<void> {
  await ingest({
    type: 'text',
    workspaceId,
    title: 'LangGraph State Management',
    content: `LangGraph is a library for building stateful, multi-actor applications with LLMs.
It extends LangChain expression language with cyclic graph execution.
State in LangGraph is a typed dictionary shared across all nodes in the graph.
Each node receives the current state and returns an update to merge into it.
Checkpointing persists state between runs, enabling resumable and fault-tolerant workflows.
Human-in-the-loop workflows pause execution and wait for user input before continuing.
The StateGraph class is the core primitive, compiled with a checkpointer for persistence.`,
  });

  await ingest({
    type: 'text',
    workspaceId,
    title: 'RAG Pipeline Architecture',
    content: `Retrieval-Augmented Generation combines document retrieval with language model generation.
A RAG pipeline first embeds documents into a vector database during ingestion.
At query time, the user query is embedded and compared against stored vectors using cosine similarity.
The top-K most relevant chunks are retrieved and injected into the LLM prompt as context.
Hybrid search combines semantic vector search with keyword-based full-text search for better recall.
Reranking applies additional scoring to improve precision before final context assembly.`,
  });

  await ingest({
    type: 'text',
    workspaceId,
    title: 'AI Agent Patterns',
    content: `AI agents are systems that use language models to reason, plan, and take actions.
The ReAct pattern interleaves reasoning steps with action execution in a loop.
Tool use allows agents to call external APIs, query databases, or run code.
Memory in agent systems includes short-term context window and long-term vector-based memory.
Multi-agent architectures use specialized agents that communicate and coordinate tasks.
Critic agents evaluate the quality of outputs and trigger revision loops when needed.`,
  });
}

async function run(): Promise<void> {
  logger.info('Starting Phase 3 retrieval smoke test...');

  const workspaceId = process.env['TEST_WORKSPACE_ID'];
  if (!workspaceId) throw new Error('TEST_WORKSPACE_ID env var required');

  logger.info('Seeding test documents...');
  await seedDocuments(workspaceId);
  logger.info('Documents seeded');

  logger.info('Test 1: relevant query — LangGraph state handling');
  const relevant = await retrieve('how does LangGraph handle state?', workspaceId);

  logger.info(
    {
      topSource: relevant.sources[0]?.title,
      chunkCount: relevant.chunks.length,
      scores: relevant.chunks.map((c) => ({
        source: c.source,
        finalScore: c.finalScore.toFixed(4),
        semanticScore: c.semanticScore.toFixed(4),
      })),
    },
    'Relevant query results',
  );

  const topSource = relevant.sources[0]?.title;
  if (!topSource?.toLowerCase().includes('langgraph')) {
    throw new Error(`Expected LangGraph doc as top result, got: "${topSource}"`);
  }

  logger.info('Test 2: irrelevant query — pizza recipes');
  const irrelevant = await retrieve('best pizza recipes with mozzarella', workspaceId);

  logger.info(
    {
      chunkCount: irrelevant.chunks.length,
      scores: irrelevant.chunks.map((c) => ({
        source: c.source,
        semanticScore: c.semanticScore.toFixed(4),
        finalScore: c.finalScore.toFixed(4),
      })),
    },
    'Irrelevant query results',
  );

  const maxSemanticScore = Math.max(...irrelevant.chunks.map((c) => c.semanticScore), 0);
  if (maxSemanticScore >= IRRELEVANT_SEMANTIC_THRESHOLD) {
    throw new Error(
      `Expected max semantic score < ${IRRELEVANT_SEMANTIC_THRESHOLD} for irrelevant query, got ${maxSemanticScore.toFixed(4)}`,
    );
  }

  logger.info(
    {
      test1: 'PASSED — LangGraph doc ranked first',
      test2: `PASSED — max irrelevant semantic score=${maxSemanticScore.toFixed(4)}`,
    },
    'Phase 3 smoke test PASSED',
  );

  await db.$client.end();
}

run().catch((err) => {
  logger.error({ err }, 'Smoke test FAILED');
  process.exit(1);
});
