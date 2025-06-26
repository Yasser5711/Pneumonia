import { z } from 'zod';
import { protectedUserProcedure, router } from '../../middlewares';
import { clearSession } from '../../utils/session';
export const userRouter = router({
  me: protectedUserProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/user/me',
        tags: ['auth'],
        summary: 'Get current user information',
      },
    })
    .input(z.object({}))
    .output(z.object({ user: z.any() }))
    .query(({ ctx }) => {
      return ctx.services.userService.getMe(ctx.user.id);
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
      clearSession(ctx.res);
      return { success: true };
    }),
  generateMyKey: protectedUserProcedure
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
      const { key } = await ctx.services.apiKeyService.generateKey({
        userId: ctx.user.id,
      });
      return { apiKey: key };
    }),
});
