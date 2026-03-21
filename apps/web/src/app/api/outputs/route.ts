import { z } from 'zod';
import { headers } from 'next/headers';
import { listTasks, getWorkspaceByIdAndUser } from '@workspace/db';
import { auth } from '@/lib/auth';
import { ok, badRequest, unauthorized, forbidden, serverError } from '@/lib/api-response';

const QuerySchema = z.object({
  workspaceId: z.string().uuid('workspaceId must be a valid UUID'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return unauthorized();

    const { searchParams } = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      workspaceId: searchParams.get('workspaceId'),
      limit: searchParams.get('limit') ?? 50,
    });
    if (!parsed.success) return badRequest(parsed.error.issues);

    const workspace = await getWorkspaceByIdAndUser(parsed.data.workspaceId, session.user.id);
    if (!workspace) return forbidden('Workspace not found or access denied');

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
