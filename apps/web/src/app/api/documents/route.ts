import { z } from 'zod';
import { listDocuments } from '@workspace/db';
import { ok, badRequest, serverError } from '@/lib/api-response';

const ListDocsSchema = z.object({
  workspaceId: z.string().uuid(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = ListDocsSchema.safeParse({ workspaceId: searchParams.get('workspaceId') });
    if (!parsed.success) return badRequest(parsed.error.issues);

    const documents = await listDocuments(parsed.data.workspaceId);
    return ok({ documents });
  } catch {
    return serverError();
  }
}
