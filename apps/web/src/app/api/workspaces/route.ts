import { z } from 'zod';
import { headers } from 'next/headers';
import { createWorkspace, listWorkspaces } from '@workspace/db';
import { auth } from '@/lib/auth';
import { ok, created, badRequest, unauthorized, serverError } from '@/lib/api-response';

const CreateSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return unauthorized();

    const workspaces = await listWorkspaces(session.user.id);
    return ok({ workspaces });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Failed to list workspaces');
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return unauthorized();

    const body = await request.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues);

    const workspace = await createWorkspace({ name: parsed.data.name, userId: session.user.id });
    return created({ workspace });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Failed to create workspace');
  }
}
