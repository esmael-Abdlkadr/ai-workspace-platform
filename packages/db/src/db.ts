import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';
import { logger } from './logger.js';

if (!process.env['DATABASE_URL']) {
  throw new Error('DATABASE_URL environment variable is required');
}

const connectionString = process.env['DATABASE_URL'];

const queryClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: (notice) => {
    logger.debug({ notice }, 'PostgreSQL notice');
  },
});

export const migrationClient = postgres(connectionString, { max: 1 });

export const db = drizzle(queryClient, {
  schema,
  logger: {
    logQuery(query: string, params: unknown[]): void {
      logger.debug({ query, params }, 'db query');
    },
  },
});

export type Db = typeof db;
