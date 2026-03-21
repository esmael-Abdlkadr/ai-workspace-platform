import { headers } from 'next/headers';
import { getTask, getWorkspaceByIdAndUser } from '@workspace/db';
import { auth } from '@/lib/auth';
import { ok, notFound, unauthorized, forbidden, serverError } from '@/lib/api-response';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return unauthorized();

    const { id } = await params;
    const task = await getTask(id);
    if (!task) return notFound('Task not found');

    const workspace = await getWorkspaceByIdAndUser(task.workspaceId, session.user.id);
    if (!workspace) return forbidden('Access denied');

    return ok({ task });
  } catch {
    return serverError();
  }
}
