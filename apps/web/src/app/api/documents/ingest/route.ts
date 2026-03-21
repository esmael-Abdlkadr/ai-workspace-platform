import { z } from 'zod';
import { ingest } from '@workspace/rag';
import { ok, badRequest, serverError } from '@/lib/api-response';

const IngestSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    content: z.string().min(1),
    workspaceId: z.string().uuid(),
    title: z.string().optional(),
  }),
  z.object({
    type: z.literal('url'),
    url: z.string().url(),
    workspaceId: z.string().uuid(),
    title: z.string().optional(),
  }),
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = IngestSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues);

    const data = parsed.data;
    const title = data.title ?? (data.type === 'url' ? data.url : data.content.slice(0, 80));

    const input =
      data.type === 'text'
        ? { workspaceId: data.workspaceId, title, type: 'text' as const, content: data.content }
        : { workspaceId: data.workspaceId, title, type: 'url' as const, url: data.url };

    const result = await ingest(input);
    return ok({ documentId: result.documentId, chunkCount: result.chunkCount, status: result.status });
  } catch {
    return serverError();
  }
}
