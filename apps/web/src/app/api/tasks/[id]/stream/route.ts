import { headers } from 'next/headers';
import { getTask, getWorkspaceByIdAndUser } from '@workspace/db';
import { auth } from '@/lib/auth';

const POLL_INTERVAL_MS = 800;
const TERMINAL_STATUSES = new Set(['complete', 'error']);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { id } = await params;

  const task = await getTask(id);
  if (!task) {
    return new Response(JSON.stringify({ error: 'Task not found' }), { status: 404 });
  }

  const workspace = await getWorkspaceByIdAndUser(task.workspaceId, session.user.id);
  if (!workspace) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const encoder = new TextEncoder();

  function send(data: Record<string, unknown>): Uint8Array {
    return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
  }

  const stream = new ReadableStream({
    async start(controller) {
      let lastStep: string | null = null;
      let lastStatus: string | null = null;

      const poll = async () => {
        try {
          const t = await getTask(id);

          if (!t) {
            controller.enqueue(send({ error: 'Task not found' }));
            controller.close();
            return;
          }

          const stepChanged = t.currentStep !== lastStep;
          const statusChanged = t.status !== lastStatus;

          if (stepChanged || statusChanged) {
            lastStep = t.currentStep ?? null;
            lastStatus = t.status;
            controller.enqueue(
              send({
                currentStep: t.currentStep,
                status: t.status,
                notionPageUrl: t.notionPageUrl,
              }),
            );
          }

          if (TERMINAL_STATUSES.has(t.status)) {
            controller.close();
            return;
          }

          setTimeout(poll, POLL_INTERVAL_MS);
        } catch {
          controller.enqueue(send({ error: 'Stream error' }));
          controller.close();
        }
      };

      await poll();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
