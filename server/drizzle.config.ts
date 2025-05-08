import { defineConfig } from 'drizzle-kit';
import { env } from './src/env';

export default defineConfig({
  out: './src/db/migrations',
  schema: './src/db/schema',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL! || env.DATABASE_URL!,
  },
});
