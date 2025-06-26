import { z } from 'zod';
import { publicProcedure, router } from '../../middlewares';
import { setSession } from '../../utils/session';

async function fetchGitHubProfile(token: string) {
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(await res.json());
  return (await res.json()) as { id: string; email: string };
}

export const githubRouter = router({
  githubStart: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/auth/github/login',
        tags: ['auth'],
        summary: 'Login/Register via GitHub',
      },
    })
    .input(z.object({}))
    .output(z.object({ redirectUrl: z.string() }))
    .query(async ({ ctx }) => {
      const redirectUrl = await ctx.fastify.githubOauth.generateAuthorizationUri(ctx.req, ctx.res);
      return { redirectUrl };
    }),

  githubCallback: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/github/callback',
        tags: ['auth'],
        summary: 'GitHub OAuth Callback',
      },
    })
    .input(z.object({ code: z.string(), state: z.string() }))
    .output(z.object({ apiKey: z.string() }))
    .mutation(async ({ ctx }) => {
      try {
        const token = await ctx.fastify.githubOauth.getAccessTokenFromAuthorizationCodeFlow(
          ctx.req,
        );
        const profile = await fetchGitHubProfile(token.token.access_token);
        const user = await ctx.services.userService.createOrUpdateOAuthUser({
          provider: 'github',
          providerId: String(profile.id),
          email: profile.email,
        });
        const { key } = await ctx.services.apiKeyService.generateKey({
          userId: user.id,
          quota: 10,
        });
        setSession({ res: ctx.res, userId: user.id, ttl: '7d' });
        return { apiKey: key };
      } catch {
        throw new Error('Failed to get access token from GitHub');
      }
    }),
});
