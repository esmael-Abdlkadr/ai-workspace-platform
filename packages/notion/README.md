# @workspace/notion

Notion write-back pipeline for publishing AI-generated documents to Notion workspaces.

## Pipeline (Phase 6)

```
Final document (markdown)
  → MarkdownToNotionConverter  (markdown → Notion block array)
  → NotionPageBuilder          (apply template: research-report / content-draft)
  → NotionPublisher.publish()  (create page via Notion API)
  → Save reference in Supabase (notion_references table)
```

## Templates

| Template | Used for |
|---|---|
| `research-report` | Research and analysis tasks |
| `content-draft` | Writing and content tasks |

## Rate Limiting

Notion API allows 3 requests/second. All writes use exponential backoff on 429 responses.

> Current status: scaffold stub only. Full implementation begins in Phase 6.
