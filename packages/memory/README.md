# @workspace/memory

Three-tier memory system for persistent AI context across sessions.

## Memory Tiers

| Tier | Storage | Scope | Implementation |
|---|---|---|---|
| Short-term | In-memory Map | Current session | Buffer (last 20 messages) |
| Long-term | Supabase pgvector | Cross-session | Semantic similarity search |
| Structured | Supabase PostgreSQL | Persistent facts | Direct SQL queries |

## Tables (Supabase)

- `long_term_memories` — vector embeddings of past interactions
- `structured_memory` — key-value facts, preferences, entity mentions

> Current status: scaffold stub only. Full implementation begins in Phase 4.
