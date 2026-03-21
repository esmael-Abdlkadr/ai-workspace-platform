import { getTask } from '@workspace/db';

const POLL_INTERVAL_MS = 800;
const TERMINAL_STATUSES = new Set(['complete', 'error']);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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
          const task = await getTask(id);

          if (!task) {
            controller.enqueue(send({ error: 'Task not found' }));
            controller.close();
            return;
          }

          const stepChanged = task.currentStep !== lastStep;
          const statusChanged = task.status !== lastStatus;

          if (stepChanged || statusChanged) {
            lastStep = task.currentStep ?? null;
            lastStatus = task.status;
            controller.enqueue(
              send({
                currentStep: task.currentStep,
                status: task.status,
                notionPageUrl: task.notionPageUrl,
              }),
            );
          }

          if (TERMINAL_STATUSES.has(task.status)) {
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
