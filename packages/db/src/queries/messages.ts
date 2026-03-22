import { eq, asc } from 'drizzle-orm';
import { db } from '../db.js';
import { messages, type Message, type NewMessage } from '../schema/messages.js';

export async function createMessage(input: NewMessage): Promise<Message> {
  const [msg] = await db.insert(messages).values(input).returning();
  if (!msg) throw new Error('Failed to create message');
  return msg;
}

export async function listMessages(
  conversationId: string,
  limit = 50,
): Promise<Message[]> {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt))
    .limit(limit);
}
