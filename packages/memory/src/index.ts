// @workspace/memory
// Three-tier memory system:
//   - Short-term: conversation buffer (in-memory)
//   - Long-term: vector memory (Supabase pgvector)
//   - Structured: relational memory (Supabase PostgreSQL)
// Phase 4 will implement the full memory system.

export const MEMORY_PACKAGE_VERSION = '0.0.0';
