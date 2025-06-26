import { z } from 'zod';
import { publicProcedure, router } from '../../middlewares';
import { setSession } from '../../utils/session';

async function fetchGoogleProfile(token: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(await res.json());
  return (await res.json()) as { sub: string; email: string };
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
    .query(async ({ ctx }) => {
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
    .mutation(async ({ ctx }) => {
      const token = await ctx.fastify.googleOauth.getAccessTokenFromAuthorizationCodeFlow(ctx.req);
      const profile = await fetchGoogleProfile(token.token.access_token);
      const user = await ctx.services.userService.createOrUpdateOAuthUser({
        provider: 'google',
        providerId: profile.sub,
        email: profile.email,
      });
      const { key } = await ctx.services.apiKeyService.generateKey({ userId: user.id, quota: 10 });
      setSession({ res: ctx.res, userId: user.id, ttl: '7d' });
      return { apiKey: key };
    }),
});
