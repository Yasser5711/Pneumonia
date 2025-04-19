import { z } from 'zod';
import { publicProcedure } from '../trpc';
export const helloWorldRouter = publicProcedure
  .input(
    z.object({
      name: z.string().min(1).max(100).optional(),
    }),
  )
  .output(
    z.object({
      message: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { name } = input;

    return {
      message: `Hello, ${name || 'Guest'}!`,
    };
  });
