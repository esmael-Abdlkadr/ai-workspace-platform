# @workspace/db

Supabase client, schema types, and the shared Pino logger used across all packages.

## Exports

| Export | Description |
|---|---|
| `logger` | Pino logger singleton (JSON in prod, pretty-print in dev) |
| `Logger` | TypeScript type for the logger |

> Phase 1 will add: Supabase client, generated database types, and typed query helpers.

## Usage

```typescript
import { logger } from '@workspace/db';

logger.info({ userId: '123' }, 'User connected');
logger.error({ error, taskId }, 'Task failed');
```
