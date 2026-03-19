import { eq } from 'drizzle-orm';
import { db } from '../db.js';
import { workspaces, type NewWorkspace, type Workspace } from '../schema/workspaces.js';

export async function createWorkspace(input: NewWorkspace): Promise<Workspace> {
  const [workspace] = await db.insert(workspaces).values(input).returning();
  if (!workspace) throw new Error('Failed to create workspace');
  return workspace;
}

export async function getWorkspace(id: string): Promise<Workspace | null> {
  const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
  return workspace ?? null;
}

export async function listWorkspaces(): Promise<Workspace[]> {
  return db.select().from(workspaces).orderBy(workspaces.createdAt);
}

export async function updateWorkspace(
  id: string,
  input: Partial<NewWorkspace>,
): Promise<Workspace> {
  const [workspace] = await db
    .update(workspaces)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(workspaces.id, id))
    .returning();
  if (!workspace) throw new Error(`Workspace ${id} not found`);
  return workspace;
}

export async function deleteWorkspace(id: string): Promise<void> {
  await db.delete(workspaces).where(eq(workspaces.id, id));
}
