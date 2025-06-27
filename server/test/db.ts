// test/db.ts
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { apiKeysTable, usersTable } from 'src/db/schema';

const MIGRATIONS_DIR = 'src/db/migrations';

export const dbClient = new PGlite('memory://');
export const db = drizzle(dbClient, { schema: { apiKeysTable, usersTable } });

let hasMigrated = false;

export async function applyMigration() {
  if (hasMigrated) return;

  for (const file of readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');
    // 👉 on exécute le *fichier complet* via le client, qui accepte le multi-statement
    await dbClient.exec(sql);
  }

  hasMigrated = true;
}

export async function resetDb() {
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(apiKeysTable);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(usersTable);
}
