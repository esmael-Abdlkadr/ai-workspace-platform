import { eq, desc } from 'drizzle-orm';
import { db } from '../db.js';
import { tasks, type NewTask, type Task } from '../schema/tasks.js';

export async function createTask(input: NewTask): Promise<Task> {
  const [task] = await db.insert(tasks).values(input).returning();
  if (!task) throw new Error('Failed to create task');
  return task;
}

export async function getTask(id: string): Promise<Task | null> {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return task ?? null;
}

export async function listTasks(workspaceId: string, limit = 50): Promise<Task[]> {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.workspaceId, workspaceId))
    .orderBy(desc(tasks.createdAt))
    .limit(limit);
}

export async function updateTask(id: string, input: Partial<NewTask>): Promise<Task> {
  const [task] = await db
    .update(tasks)
    .set(input)
    .where(eq(tasks.id, id))
    .returning();
  if (!task) throw new Error(`Task ${id} not found`);
  return task;
}

export async function completeTask(
  id: string,
  result: string,
  notionPageUrl?: string,
): Promise<Task> {
  const [task] = await db
    .update(tasks)
    .set({
      status: 'complete',
      result,
      notionPageUrl: notionPageUrl ?? null,
      completedAt: new Date(),
    })
    .where(eq(tasks.id, id))
    .returning();
  if (!task) throw new Error(`Task ${id} not found`);
  return task;
}

export async function failTask(id: string, errorMessage: string): Promise<Task> {
  const [task] = await db
    .update(tasks)
    .set({ status: 'error', errorMessage, completedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning();
  if (!task) throw new Error(`Task ${id} not found`);
  return task;
}
