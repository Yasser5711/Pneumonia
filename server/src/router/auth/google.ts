import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { env } from '../../env';
import { GoogleRequestFailedError } from '../../errors';
import { publicProcedure, router } from '../../middlewares';
import { setSession } from '../../utils/session';

/**
 * Makes a request to Google API
 * @param url - The Google API URL
 * @param init - Fetch options
 * @throws {GoogleRequestFailedError} When Google request fails
 */
async function googleRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(url, init);
  if (!r.ok) throw new GoogleRequestFailedError(url);
  return (await r.json()) as T;
}

async function fetchGoogleProfile(token: string) {
  const res = await googleRequest('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res as { sub: string; email: string; picture: string | null };
}

export const googleRouter = router({
  googleStart: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/auth/google/login',
        tags: ['auth'],
        summary: 'Login/Register via Google',
      },
    })
    .input(z.object({}))
    .output(z.object({ redirectUrl: z.string() }))
    .mutation(async ({ ctx }) => {
      if (!env.ENABLE_LOCAL_AUTH) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Google authentication is currently disabled.',
        });
      }
      const redirectUrl = await ctx.fastify.googleOauth.generateAuthorizationUri(ctx.req, ctx.res);
      return { redirectUrl };
    }),
  googleCallback: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/auth/google/callback',
        tags: ['auth'],
        summary: 'Google OAuth Callback',
      },
    })
    .input(z.object({ code: z.string(), state: z.string() }))
    .output(z.object({ apiKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!env.ENABLE_LOCAL_AUTH) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Google authentication is currently disabled.',
        });
      }
      ctx.req.query = input;
      const token = await ctx.fastify.googleOauth.getAccessTokenFromAuthorizationCodeFlow(ctx.req);
      const profile = await fetchGoogleProfile(token.token.access_token);
      const user = await ctx.services.userService.createOrUpdateOAuthUser({
        provider: 'google',
        providerId: profile.sub,
        email: profile.email,
        avatarUrl: profile.picture || null,
      });
      const { key } = await ctx.services.apiKeyService.generateKey({ userId: user.id, quota: 10 });
      setSession({ res: ctx.res, userId: user.id, ttl: '7d' });
      return { apiKey: key };
    }),
});
