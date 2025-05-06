// /* eslint-disable no-console */

// import { drizzle } from 'drizzle-orm/postgres-js';
// import { migrate } from 'drizzle-orm/postgres-js/migrator';
// import { dirname, join, resolve } from 'path';
// import postgres from 'postgres';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// console.log('📁 Current file:', __filename);
// console.log('📁 Current directory:', __dirname);

// const migrationsPath = resolve(__dirname, '../src/db/migrations');
// const journalPath = join(migrationsPath, 'meta/_journal.json');

// console.log('📁 Migrations path:', migrationsPath);

// const NODE_ENV = process.env.NODE_ENV ?? 'development';

// if (!process.env.DATABASE_URL) {
//   console.error('❌ DATABASE_URL is not defined');
//   process.exit(1);
// }

// const isSecureEnv = ['production', 'preview'].includes(NODE_ENV);

// const client = postgres(process.env.DATABASE_URL, {
//   ssl: {
//     rejectUnauthorized: false,
//   },
//   prepare: NODE_ENV === 'development',
// });

// const db = drizzle(client);

// (async () => {
//   try {
//     console.log('⏳ Running migrations...');
//     const migrationConfig = {
//       migrationsFolder: migrationsPath,
//     };

//     await migrate(db, migrationConfig);
//     console.log('✅ Migrations complete!');
//     process.exit(0);
//   } catch (err) {
//     console.error('❌ Migration failed:', err);
//     process.exit(1);
//   }
// })();
