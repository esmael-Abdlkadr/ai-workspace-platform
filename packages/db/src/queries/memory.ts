import { eq, sql, and } from 'drizzle-orm';
import { db } from '../db.js';
import {
  longTermMemories,
  type NewLongTermMemory,
  type LongTermMemory,
} from '../schema/long_term_memories.js';
import {
  structuredMemory,
  type NewStructuredMemory,
  type StructuredMemory,
} from '../schema/structured_memory.js';

// ---- Long-term vector memory ----

export async function saveLongTermMemory(input: NewLongTermMemory): Promise<LongTermMemory> {
  const [memory] = await db.insert(longTermMemories).values(input).returning();
  if (!memory) throw new Error('Failed to save long-term memory');
  return memory;
}

export type SimilarMemory = LongTermMemory & { similarity: number };

export async function searchLongTermMemory(
  embedding: number[],
  workspaceId: string,
  topK = 5,
): Promise<SimilarMemory[]> {
  const embeddingStr = `[${embedding.join(',')}]`;

  const result = await db.execute<LongTermMemory & { similarity: number }>(sql`
    SELECT
      m.*,
      1 - (m.embedding <=> ${embeddingStr}::vector) AS similarity
    FROM long_term_memories m
    WHERE m.workspace_id = ${workspaceId}
    ORDER BY m.embedding <=> ${embeddingStr}::vector
    LIMIT ${topK}
  `);

  return result as unknown as SimilarMemory[];
}

// ---- Structured relational memory ----

export async function saveStructuredMemory(input: NewStructuredMemory): Promise<StructuredMemory> {
  // Upsert: insert or update on (workspace_id, key) conflict
  const [memory] = await db
    .insert(structuredMemory)
    .values(input)
    .onConflictDoUpdate({
      target: [structuredMemory.workspaceId, structuredMemory.key],
      set: { value: input.value, updatedAt: new Date() },
    })
    .returning();
  if (!memory) throw new Error('Failed to save structured memory');
  return memory;
}

export async function getStructuredMemory(
  workspaceId: string,
  key: string,
): Promise<StructuredMemory | null> {
  const [memory] = await db
    .select()
    .from(structuredMemory)
    .where(and(eq(structuredMemory.workspaceId, workspaceId), eq(structuredMemory.key, key)))
    .limit(1);
  return memory ?? null;
}

export async function listStructuredMemoryByCategory(
  workspaceId: string,
  category: string,
): Promise<StructuredMemory[]> {
  return db
    .select()
    .from(structuredMemory)
    .where(and(eq(structuredMemory.workspaceId, workspaceId), eq(structuredMemory.category, category)));
}
