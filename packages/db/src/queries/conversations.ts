import { and, eq, desc, isNull } from 'drizzle-orm';
import { db } from '../db.js';
import { conversations, type Conversation, type NewConversation } from '../schema/conversations.js';

export async function createConversation(input: NewConversation): Promise<Conversation> {
  const [conv] = await db.insert(conversations).values(input).returning();
  if (!conv) throw new Error('Failed to create conversation');
  return conv;
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);
  return conv ?? null;
}

export async function getConversationByIdAndUser(
  id: string,
  userId: string,
): Promise<Conversation | null> {
  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
    .limit(1);
  return conv ?? null;
}

export async function listConversations(
  workspaceId: string,
  userId: string,
): Promise<Conversation[]> {
  return db
    .select()
    .from(conversations)
    .where(and(eq(conversations.workspaceId, workspaceId), eq(conversations.userId, userId)))
    .orderBy(desc(conversations.updatedAt));
}

export async function listChatConversations(userId: string): Promise<Conversation[]> {
  return db
    .select()
    .from(conversations)
    .where(and(eq(conversations.userId, userId), isNull(conversations.workspaceId), eq(conversations.mode, 'chat')))
    .orderBy(desc(conversations.updatedAt));
}

export async function updateConversationTitle(id: string, title: string): Promise<void> {
  await db
    .update(conversations)
    .set({ title, updatedAt: new Date() })
    .where(eq(conversations.id, id));
}

export async function touchConversation(id: string): Promise<void> {
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, id));
}

export async function renameConversation(id: string, userId: string, title: string): Promise<void> {
  await db
    .update(conversations)
    .set({ title, updatedAt: new Date() })
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
}

export async function deleteConversation(id: string, userId: string): Promise<void> {
  await db
    .delete(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
}
