import { z } from 'zod';
import { createWorkspace, listWorkspaces } from '@workspace/db';
import { ok, created, badRequest, serverError } from '@/lib/api-response';

const CreateSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function GET() {
  try {
    const workspaces = await listWorkspaces();
    return ok({ workspaces });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Failed to list workspaces');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues);
    const workspace = await createWorkspace({ name: parsed.data.name });
    return created({ workspace });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Failed to create workspace');
  }
}
