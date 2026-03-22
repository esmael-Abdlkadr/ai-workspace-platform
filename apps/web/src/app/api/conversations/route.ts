import { z } from 'zod';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import {
  createConversation,
  listConversations,
  getWorkspaceByIdAndUser,
} from '@workspace/db';
import { ok, created, badRequest, unauthorized, forbidden, serverError } from '@/lib/api-response';

const ListSchema = z.object({
  workspaceId: z.string().uuid(),
});

const CreateSchema = z.object({
  workspaceId: z.string().uuid(),
});

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return unauthorized();

    const { searchParams } = new URL(request.url);
    const parsed = ListSchema.safeParse({ workspaceId: searchParams.get('workspaceId') });
    if (!parsed.success) return badRequest(parsed.error.issues);

    const workspace = await getWorkspaceByIdAndUser(parsed.data.workspaceId, session.user.id);
    if (!workspace) return forbidden('Workspace not found or access denied');

    const conversations = await listConversations(parsed.data.workspaceId, session.user.id);
    return ok({ conversations });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Failed to list conversations');
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return unauthorized();

    const body = await request.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues);

    const workspace = await getWorkspaceByIdAndUser(parsed.data.workspaceId, session.user.id);
    if (!workspace) return forbidden('Workspace not found or access denied');

    const conversation = await createConversation({
      workspaceId: parsed.data.workspaceId,
      userId: session.user.id,
    });

    return created({ conversation });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Failed to create conversation');
  }
}
