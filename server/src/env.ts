import * as dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production', 'preview']),
  FRONTEND_ORIGIN: z.string().optional(),
  CNN_PREDICT_URL: z.string().url().optional(),
  DATABASE_URL: z.string().url(),
  SALT_ROUNDS: z.number().gte(4).lte(120).default(12),
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
