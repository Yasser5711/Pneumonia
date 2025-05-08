import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { apiKeysTable, usersTable } from 'src/db/schema';

const MIGRATIONS_DIR = 'src/db/migrations';
// ts-prune-ignore-next
export const dbClient = new PGlite('memory://');
export const db = drizzle(dbClient, {
  schema: { apiKeysTable, usersTable },
});

let hasMigrated = false;

export const applyMigration = async () => {
  if (hasMigrated) return;

  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'));
  for (const file of files) {
    const content = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');

    const statements = content
      .split(/;\s*$/gm)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await db.execute(statement);
    }
  }

  hasMigrated = true;
};

export async function resetDb() {
  await db.delete(apiKeysTable);
  await db.delete(usersTable);
}
