import { z } from 'zod';
import { headers } from 'next/headers';
import Groq from 'groq-sdk';
import { auth } from '@/lib/auth';
import {
  getConversationByIdAndUser,
  listMessages,
  createMessage,
  updateConversationTitle,
  touchConversation,
} from '@workspace/db';
import { generateConversationTitle } from '@workspace/rag';
import { ok, unauthorized, forbidden, serverError } from '@/lib/api-response';

export const maxDuration = 120;

const SYSTEM_PROMPT = `You are a brilliant, helpful AI assistant with deep knowledge across science, technology, research, writing, analysis, and creative thinking. You give clear, structured, accurate answers. When helpful, use markdown (headers, bullet points, code blocks). Be concise but thorough. Today's date: ${new Date().toDateString()}.`;

const SendMessageSchema = z.object({
  content: z.string().min(1).max(8000),
});

function getGroq(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is required');
  return new Groq({ apiKey });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return unauthorized();

    const { id } = await params;
    const conv = await getConversationByIdAndUser(id, session.user.id);
    if (!conv) return forbidden('Conversation not found');

    const msgs = await listMessages(id);
    return ok({ messages: msgs });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Failed to load messages');
  }
}

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
    try { body = await request.json(); } catch {
      return serverError('Invalid JSON');
    }

    const parsed = SendMessageSchema.safeParse(body);
    if (!parsed.success) return serverError('Validation failed');

    const userContent = parsed.data.content;

    await createMessage({ conversationId: id, role: 'user', content: userContent });

    const history = await listMessages(id, 30);
    const historyMessages = history.slice(0, -1).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const groq = getGroq();
    const model = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...historyMessages,
        { role: 'user', content: userContent },
      ],
      temperature: 0.6,
      max_tokens: 2048,
      stream: false,
    });

    const content = completion.choices[0]?.message?.content ?? '';

    const assistantMessage = await createMessage({
      conversationId: id,
      role: 'assistant',
      content,
    });

    await touchConversation(id);

    const isFirstExchange = historyMessages.length === 0;
    if (isFirstExchange && conv.title === 'New conversation') {
      generateConversationTitle(userContent)
        .then((title) => updateConversationTitle(id, title))
        .catch(() => undefined);
    }

    return ok({ message: assistantMessage });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Failed to process message');
  }
}
