import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { env } from '../env';

import * as schema from './schema';

const ssl =
  env.NODE_ENV === 'production' || env.NODE_ENV === 'preview'
    ? { rejectUnauthorized: false }
    : false;
const client = postgres(env.DATABASE_URL, { prepare: env.NODE_ENV === 'development', ssl });

export let db = drizzle(client, {
  schema,
  casing: 'snake_case',
  logger: env.NODE_ENV === 'development' || env.NODE_ENV === 'test',
});
