# @workspace/rag

RAG (Retrieval-Augmented Generation) pipeline for document ingestion and semantic retrieval.

## Pipeline Stages

### Ingestion (Phase 2)
```
Document (PDF / URL / text) → Loader → Chunker → Embedder → VectorStore
```

### Retrieval (Phase 3)
```
Query → Embed → SemanticSearch + KeywordSearch → Reranker → ContextAssembler
```

## Configuration

| Setting | Value |
|---|---|
| Embedding model | `text-embedding-ada-002` (1536 dims) |
| Chunk size | 512 tokens |
| Chunk overlap | 64 tokens |
| Retrieval top-k | 5 chunks |

> Current status: scaffold stub only. Full implementation begins in Phase 2.
