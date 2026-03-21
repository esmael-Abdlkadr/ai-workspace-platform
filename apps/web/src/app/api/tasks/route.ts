import { z } from 'zod';
import { createTask, listTasks } from '@workspace/db';
import { WorkflowRunner } from '@workspace/agents';
import { ok, created, badRequest, serverError } from '@/lib/api-response';

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
    const body = await request.json();
    const parsed = CreateTaskSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues);

    const { prompt, workspaceId } = parsed.data;
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
    const { searchParams } = new URL(request.url);
    const parsed = ListTasksSchema.safeParse({
      workspaceId: searchParams.get('workspaceId'),
      limit: searchParams.get('limit') ?? 20,
    });
    if (!parsed.success) return badRequest(parsed.error.issues);

    const tasks = await listTasks(parsed.data.workspaceId, parsed.data.limit);
    return ok({ tasks });
  } catch {
    return serverError();
  }
}
