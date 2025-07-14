import { z } from 'zod';

import { protectedProcedure } from '../middlewares/index';

export const helloWorldRouter = protectedProcedure
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
  .query(({ input, ctx }) => {
    const { name } = input;
    console.log(`Hello World request received with name: ${ctx}`);
    return {
      message: `Hello, ${name || 'Guest'}!`,
    };
  });
