import * as dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from './logger';
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  FRONTEND_ORIGIN: z.string().optional(),
  API_KEY: z.string().min(1),
  CNN_PREDICT_URL: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  logger().error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
// ts-prune-ignore-next
export type Env = z.infer<typeof envSchema>;
export const env = parsed.data;
