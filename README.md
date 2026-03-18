# AI Workspace Platform

A production-level, multi-agent AI workspace where autonomous agents (Researcher, Writer, Critic, Memory) collaborate to complete knowledge tasks, publish outputs to Notion, and persist memory in Supabase.

## Stack

| Layer | Technology |
|---|---|
| Orchestration | LangChain + LangGraph (TypeScript) |
| Vector Store | Supabase pgvector |
| Database | Supabase (PostgreSQL) |
| Knowledge Output | Notion API |
| Frontend | Next.js 14 (App Router) |
| Language | TypeScript (full stack) |
| Logging | Pino |
| Validation | Zod |

## Monorepo Structure

```
apps/
  web/           # Next.js 14 frontend
packages/
  agents/        # LangGraph multi-agent system
  rag/           # RAG ingestion + retrieval pipeline
  memory/        # Three-tier memory system
  notion/        # Notion write-back pipeline
  db/            # Supabase client, schema types, logger
```

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy and fill in environment variables
cp .env.example .env

# 3. Build all packages
pnpm build

# 4. Start development server
pnpm dev
```

## Development Phases

See [PHASES.md](./PHASES.md) for the full build plan and progress tracker.

## Architecture

See [KNOWLEDGE_BASE.md](./KNOWLEDGE_BASE.md) for full architecture diagrams, agent specs, database schema, and all technical decisions.
