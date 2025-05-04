import { env } from '@env';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(env.DATABASE_URL, {
  prepare: env.NODE_ENV === 'development',
});

export let db = drizzle(client, { schema });
