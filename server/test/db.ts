import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from '../src/db/schema';

import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationsPath = resolve(__dirname, '../src/db/migrations');
type DatabaseClient = ReturnType<typeof drizzle>;

async function initDatabase(): Promise<DatabaseClient> {
  const client = new PGlite();
  const db = drizzle(client, { schema });

  await migrate(db, {
    migrationsFolder: migrationsPath,
  });

  return db;
}

export async function initTestDatabase(): Promise<DatabaseClient> {
  return initDatabase();
}
