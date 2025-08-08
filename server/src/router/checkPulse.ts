import { z } from 'zod';

import { publicProcedure } from '../middlewares/index';

export const checkPulseRouter = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/check-pulse',
      summary: 'Check Pulse',
      description: 'Returns a 200 OK response if the server is alive.',
      protect: false,
    },
  })
  .input(z.object({}))
  .output(
    z.object({
      message: z.string(),
    }),
  )
  .query(({}) => {
    return {
      message: `Server is alive`,
    };
  });
