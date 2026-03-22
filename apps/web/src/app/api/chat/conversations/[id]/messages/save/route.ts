
import { z } from 'zod';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getConversationByIdAndUser, createMessage } from '@workspace/db';
import { ok, unauthorized, forbidden, serverError } from '@/lib/api-response';

const SaveSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(20000),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return unauthorized();

    const { id } = await params;
    const conv = await getConversationByIdAndUser(id, session.user.id);
    if (!conv) return forbidden('Conversation not found');

    let body: unknown;
    try { body = await request.json(); } catch { return serverError('Invalid JSON'); }

    const parsed = SaveSchema.safeParse(body);
    if (!parsed.success) return serverError('Validation failed');

    const message = await createMessage({
      conversationId: id,
      role: parsed.data.role,
      content: parsed.data.content,
    });

    return ok({ message });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Failed to save message');
  }
}
