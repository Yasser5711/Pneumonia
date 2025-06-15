/* eslint-disable no-console */
import { config } from 'dotenv';
// import { execa } from 'execa';
import postgres from 'postgres';

config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL || DATABASE_URL.length === 0) {
  console.error('❌ DATABASE_URL not found in .env');
  process.exit(1);
}

async function resetDatabase(): Promise<void> {
  console.log('⚠️  Dropping public schema...');

  const sql = postgres(DATABASE_URL!, { max: 1 });

  try {
    await sql`DROP SCHEMA public CASCADE;`;
    await sql`CREATE SCHEMA public;`;
    console.log('✅ public schema reset');
  } catch (err) {
    console.error('❌ Failed to reset schema:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }

  // console.log('🚀 Running db:generate...');
  // await execa('yarn', ['db:generate'], { stdio: 'inherit' });

  // console.log('🚀 Running db:migrate...');
  // await execa('yarn', ['db:migrate'], { stdio: 'inherit' });

  // console.log('🚀 Running db:push...');
  // await execa('yarn', ['db:push'], { stdio: 'inherit' });

  // console.log('🚀 Running db:seed...');
  // await execa('yarn', ['db:seed'], { stdio: 'inherit' });

  // console.log('✅ Database reset, migrations applied, and push executed');
}

void resetDatabase();
