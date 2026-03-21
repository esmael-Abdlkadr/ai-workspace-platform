import { getTask } from '@workspace/db';
import { ok, notFound, serverError } from '@/lib/api-response';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const task = await getTask(id);
    if (!task) return notFound('Task not found');
    return ok({ task });
  } catch {
    return serverError();
  }
}
