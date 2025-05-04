import { protectedProcedureAPI } from '@middlewares/index';
import { z } from 'zod';

export const helloWorldRouter = protectedProcedureAPI
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
