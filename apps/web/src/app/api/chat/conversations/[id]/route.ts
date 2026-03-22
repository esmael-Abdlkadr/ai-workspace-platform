import { z } from 'zod';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getConversationByIdAndUser, renameConversation, deleteConversation } from '@workspace/db';
import { ok, unauthorized, forbidden, serverError } from '@/lib/api-response';

const RenameSchema = z.object({ title: z.string().min(1).max(200) });

export async function PATCH(
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
    const parsed = RenameSchema.safeParse(body);
    if (!parsed.success) return serverError('Title is required');

    await renameConversation(id, session.user.id, parsed.data.title);
    return ok({ success: true });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Failed to rename');
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return unauthorized();
    const { id } = await params;
    const conv = await getConversationByIdAndUser(id, session.user.id);
    if (!conv) return forbidden('Conversation not found');

    await deleteConversation(id, session.user.id);
    return ok({ success: true });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Failed to delete');
  }
}
