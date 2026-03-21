-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Enum types
CREATE TYPE "document_source_type" AS ENUM('pdf', 'text', 'url', 'notion');
CREATE TYPE "document_status" AS ENUM('pending', 'processing', 'complete', 'error');
CREATE TYPE "task_status" AS ENUM('pending', 'running', 'complete', 'error');

-- workspaces
CREATE TABLE workspaces (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  notion_database_id TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- documents
CREATE TABLE documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  source_url   TEXT,
  source_type  document_source_type NOT NULL,
  status       document_status DEFAULT 'pending' NOT NULL,
  error_message TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- chunks (pgvector)
CREATE TABLE chunks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  embedding    vector(768),
  chunk_index  INTEGER NOT NULL,
  metadata     JSONB DEFAULT '{}' NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- tasks
CREATE TABLE tasks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id     UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  prompt           TEXT NOT NULL,
  status           task_status DEFAULT 'pending' NOT NULL,
  result           TEXT,
  langgraph_run_id TEXT,
  current_step     TEXT,
  notion_page_url  TEXT,
  error_message    TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at     TIMESTAMPTZ
);

-- long_term_memories (pgvector)
CREATE TABLE long_term_memories (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id     UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  content          TEXT NOT NULL,
  embedding        vector(768),
  importance_score REAL DEFAULT 0.5 NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- structured_memory
CREATE TABLE structured_memory (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  key          TEXT NOT NULL,
  value        JSONB NOT NULL,
  category     TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (workspace_id, key)
);

-- notion_references
CREATE TABLE notion_references (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id        UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  notion_page_id TEXT NOT NULL,
  notion_page_url TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ivfflat indexes for fast vector similarity search
CREATE INDEX chunks_embedding_idx ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
CREATE INDEX long_term_memories_embedding_idx ON long_term_memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
