import { z } from 'zod';
import { headers } from 'next/headers';
import { searchLongTermMemory, getWorkspaceByIdAndUser } from '@workspace/db';
import { embedTexts } from '@workspace/rag';
import { auth } from '@/lib/auth';
import { ok, badRequest, unauthorized, forbidden, serverError } from '@/lib/api-response';

const MemorySchema = z.object({
  query: z.string().min(1),
  workspaceId: z.string().uuid(),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return unauthorized();

    const { searchParams } = new URL(request.url);
    const parsed = MemorySchema.safeParse({
      query: searchParams.get('query'),
      workspaceId: searchParams.get('workspaceId'),
      limit: searchParams.get('limit') ?? 5,
    });
    if (!parsed.success) return badRequest(parsed.error.issues);

    const { query, workspaceId, limit } = parsed.data;

    const workspace = await getWorkspaceByIdAndUser(workspaceId, session.user.id);
    if (!workspace) return forbidden('Workspace not found or access denied');

    const [embedding] = await embedTexts([query]);
    if (!embedding) return serverError('Failed to embed query');

    const memories = await searchLongTermMemory(embedding, workspaceId, limit);
    return ok({ memories });
  } catch {
    return serverError();
  }
}
