# @workspace/agents

LangGraph multi-agent orchestration system.

## Agents (implemented in Phase 4 & 5)

| Agent | Role |
|---|---|
| `ResearcherAgent` | Semantic RAG search + web lookup |
| `WriterAgent` | Drafts structured markdown documents |
| `CriticAgent` | Scores output quality (0–10), triggers retries |
| `MemoryAgent` | Saves context to all three memory tiers |

## Workflow Graph (Phase 5)

```
START → TaskRouter → Researcher → Writer → Critic
                                             ├── score < 7 → Writer (retry, max 3x)
                                             └── score >= 7 → Memory → Notion → END
```

> Current status: scaffold stub only. Full implementation begins in Phase 4.
