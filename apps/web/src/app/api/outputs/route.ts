import { z } from 'zod';
import { listTasks } from '@workspace/db';
import { ok, badRequest, serverError } from '@/lib/api-response';

const QuerySchema = z.object({
  workspaceId: z.string().uuid('workspaceId must be a valid UUID'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      workspaceId: searchParams.get('workspaceId'),
      limit: searchParams.get('limit') ?? 50,
    });
    if (!parsed.success) return badRequest(parsed.error.issues);

    const all = await listTasks(parsed.data.workspaceId, parsed.data.limit);
    const outputs = all
      .filter((t) => t.status === 'complete' && t.result)
      .map((t) => ({
        id: t.id,
        prompt: t.prompt,
        result: t.result,
        notionPageUrl: t.notionPageUrl,
        completedAt: t.completedAt,
        createdAt: t.createdAt,
      }));

    return ok({ outputs });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Failed to list outputs');
  }
}
