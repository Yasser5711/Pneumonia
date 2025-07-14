import * as dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production', 'preview']).optional(),
  FRONTEND_ORIGIN: z.string().optional().default('http://localhost:4000'),
  CNN_PREDICT_URL: z.string().url().optional(),
  CNN_MODEL_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().url().default('postgres://postgres:postgres@localhost:5432/postgres'),
  PANEL_USER: z.string().default('admin'),
  PANEL_PASS: z.string().default('admin'),
  BASE_URL: z.string().url().default('http://localhost:3000'),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  SESSION_SECRET: z.string(),
  ENABLE_LOCAL_AUTH: z.boolean().default(false),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
// ts-prune-ignore-next
export type Env = z.infer<typeof envSchema>;
export const env = parsed.data;
