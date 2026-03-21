import { z } from 'zod';
import { headers } from 'next/headers';
import { createTask, listTasks, getWorkspaceByIdAndUser } from '@workspace/db';
import { WorkflowRunner } from '@workspace/agents';
import { auth } from '@/lib/auth';
import { ok, created, badRequest, unauthorized, forbidden, serverError } from '@/lib/api-response';

const CreateTaskSchema = z.object({
  prompt: z.string().min(1),
  workspaceId: z.string().uuid(),
});

const ListTasksSchema = z.object({
  workspaceId: z.string().uuid(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return unauthorized();

    const body = await request.json();
    const parsed = CreateTaskSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues);

    const { prompt, workspaceId } = parsed.data;

    const workspace = await getWorkspaceByIdAndUser(workspaceId, session.user.id);
    if (!workspace) return forbidden('Workspace not found or access denied');

    const task = await createTask({ prompt, workspaceId });
    const runner = new WorkflowRunner();
    runner.run(prompt, workspaceId, task.id).catch(() => undefined);

    return created({ taskId: task.id, status: task.status });
  } catch {
    return serverError();
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return unauthorized();

    const { searchParams } = new URL(request.url);
    const parsed = ListTasksSchema.safeParse({
      workspaceId: searchParams.get('workspaceId'),
      limit: searchParams.get('limit') ?? 20,
    });
    if (!parsed.success) return badRequest(parsed.error.issues);

    const workspace = await getWorkspaceByIdAndUser(parsed.data.workspaceId, session.user.id);
    if (!workspace) return forbidden('Workspace not found or access denied');

    const tasks = await listTasks(parsed.data.workspaceId, parsed.data.limit);
    return ok({ tasks });
  } catch {
    return serverError();
  }
}
