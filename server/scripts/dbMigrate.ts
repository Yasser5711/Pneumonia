/* eslint-disable no-console */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { dirname, resolve } from 'path';
import postgres from 'postgres';
import { fileURLToPath } from 'url';
import { env } from '../src/env';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📁 Current file:', __filename);
console.log('📁 Current directory:', __dirname);

const NODE_ENV = process.env.NODE_ENV ?? env.NODE_ENV;

if (NODE_ENV !== 'development') {
  console.error(`❌ Migration script is disabled in "${NODE_ENV}" environment.`);
  process.exit(1);
}

const DATABASE_URL = process.env.DATABASE_URL ?? env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined');
  process.exit(1);
}

const migrationsPath = resolve(__dirname, '../src/db/migrations');
console.log('📁 Migrations path:', migrationsPath);

const client = postgres(DATABASE_URL, {
  ssl: false,
  prepare: true,
});

const db = drizzle(client);

void (async () => {
  try {
    console.log('⏳ Running migrations...');
    const migrationConfig = {
      migrationsFolder: migrationsPath,
    };

    await migrate(db, migrationConfig);
    console.log('✅ Migrations complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
})();
