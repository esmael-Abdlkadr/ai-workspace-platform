import { db, sql } from '@workspace/db';
import { ok, serviceUnavailable } from '@/lib/api-response';

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return ok({ status: 'ok', db: 'ok', timestamp: new Date().toISOString() });
  } catch {
    return serviceUnavailable('Database unreachable');
  }
}
