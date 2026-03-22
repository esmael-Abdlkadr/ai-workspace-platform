import { z } from 'zod';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import {
  createConversation,
  listChatConversations,
} from '@workspace/db';
import { ok, created, unauthorized, serverError } from '@/lib/api-response';

const CreateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return unauthorized();

    const convs = await listChatConversations(session.user.id);
    return ok({ conversations: convs });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Failed to list conversations');
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return unauthorized();

    let body: unknown;
    try { body = await request.json(); } catch { body = {}; }

    const parsed = CreateSchema.safeParse(body);
    const title = parsed.success ? (parsed.data.title ?? 'New conversation') : 'New conversation';

    const conv = await createConversation({
      userId: session.user.id,
      title,
      mode: 'chat',
    });

    return created({ conversation: conv });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Failed to create conversation');
  }
}
