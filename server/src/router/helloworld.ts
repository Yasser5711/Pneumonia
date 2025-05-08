import { z } from 'zod';
import { protectedProcedureAPI } from '../middlewares/index';

export const helloWorldRouter = protectedProcedureAPI
  .meta({
    openapi: {
      method: 'GET',
      path: '/hello',
      summary: 'Hello World',
      description: 'Returns a hello world message.',
      protect: true,
    },
  })
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
