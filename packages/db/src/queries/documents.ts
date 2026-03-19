import { eq } from 'drizzle-orm';
import { db } from '../db.js';
import { documents, type NewDocument, type Document } from '../schema/documents.js';

export async function createDocument(input: NewDocument): Promise<Document> {
  const [document] = await db.insert(documents).values(input).returning();
  if (!document) throw new Error('Failed to create document');
  return document;
}

export async function getDocument(id: string): Promise<Document | null> {
  const [document] = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  return document ?? null;
}

export async function listDocuments(workspaceId: string): Promise<Document[]> {
  return db
    .select()
    .from(documents)
    .where(eq(documents.workspaceId, workspaceId))
    .orderBy(documents.createdAt);
}

export async function updateDocumentStatus(
  id: string,
  status: Document['status'],
  errorMessage?: string,
): Promise<Document> {
  const [document] = await db
    .update(documents)
    .set({ status, errorMessage: errorMessage ?? null, updatedAt: new Date() })
    .where(eq(documents.id, id))
    .returning();
  if (!document) throw new Error(`Document ${id} not found`);
  return document;
}
