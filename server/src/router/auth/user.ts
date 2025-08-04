import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { env } from '../../env';
import { protectedUserProcedure, protectedProcedure, router } from '../../middlewares';
import { clearSession } from '../../utils/session';
export const userRouter = router({
  me: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/user/me',
        tags: ['auth'],
        summary: 'Get current user information',
      },
    })
    .input(z.object({}))
    .output(
      z.object({
        user: z.any(),
        // keys: z.array(z.any()),
        quota: z.object({ used: z.number(), total: z.number() }),
      }),
    )
    .query(async ({ ctx }) => {
      const res = await ctx.services.newUserService.getMe(ctx.userId);
      return res;
    }),
  logout: protectedUserProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/user/logout',
        tags: ['auth'],
        summary: 'Logout user',
      },
    })
    .input(z.object({}))
    .output(
      z.object({
        success: z.boolean(),
      }),
    )
    .mutation(({ ctx }) => {
      if (!env.ENABLE_LOCAL_AUTH) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Router is currently disabled.',
        });
      }
      clearSession(ctx.res);
      return { success: true };
    }),
  generateMyKey: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/user/generate-key',
        tags: ['key'],
        summary: 'Generate API key for user',
      },
    })
    .input(z.object({}))
    .output(z.object({ apiKey: z.string() }))
    .mutation(async ({ ctx }) => {
      const { key } = await ctx.services.newApiKeyService.generateKey({
        userId: ctx.userId,
      });
      return { apiKey: key };
    }),
});
