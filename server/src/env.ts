import * as dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from './logger';
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production', 'preview']),
  FRONTEND_ORIGIN: z.string().optional(),
  API_KEY: z.string().min(1),
  CNN_PREDICT_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  SALT_ROUNDS: z.number().gte(4).lte(120).default(12),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  logger().error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
// ts-prune-ignore-next
export type Env = z.infer<typeof envSchema>;
export const env = parsed.data;
