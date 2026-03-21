import { z } from 'zod';
import { retrieve } from '@workspace/rag';
import { ok, badRequest, serverError } from '@/lib/api-response';

const SearchSchema = z.object({
  query: z.string().min(1),
  workspaceId: z.string().uuid(),
  topK: z.number().int().min(1).max(20).optional().default(5),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = SearchSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues);

    const { query, workspaceId, topK } = parsed.data;
    const result = await retrieve(query, workspaceId, topK);

    return ok({
      context: result.context,
      chunks: result.chunks.map((c) => ({
        text: c.content,
        source: c.source,
        semanticScore: c.semanticScore,
      })),
    });
  } catch {
    return serverError();
  }
}
