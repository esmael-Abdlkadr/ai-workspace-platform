import { z } from 'zod';
import { headers } from 'next/headers';
import { listDocuments, getWorkspaceByIdAndUser } from '@workspace/db';
import { auth } from '@/lib/auth';
import { ok, badRequest, unauthorized, forbidden, serverError } from '@/lib/api-response';

const ListDocsSchema = z.object({
  workspaceId: z.string().uuid(),
});

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return unauthorized();

    const { searchParams } = new URL(request.url);
    const parsed = ListDocsSchema.safeParse({ workspaceId: searchParams.get('workspaceId') });
    if (!parsed.success) return badRequest(parsed.error.issues);

    const workspace = await getWorkspaceByIdAndUser(parsed.data.workspaceId, session.user.id);
    if (!workspace) return forbidden('Workspace not found or access denied');

    const documents = await listDocuments(parsed.data.workspaceId);
    return ok({ documents });
  } catch {
    return serverError();
  }
}
