import { z } from 'zod';
import { publicProcedure, router } from '../../middlewares';
import { setSession } from '../../utils/session';
import { env } from '../../env';
async function fetchGitHubProfile(token: string) {
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}` },
  });
  // console.log(await res.json());
  return (await res.json()) as { id: string; email: string };
}
async function exchangeCodeForToken(code: string) {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  if (!res.ok) throw new Error('GitHub token exchange failed');
  const { access_token } = await res.json();
  return access_token as string;
}
// async function fetchGitHubEmails(token: string) {
//   const res = await fetch('https://api.github.com/user/emails', {
//     headers: {
//       Authorization: `Bearer ${token}`,
//       Accept: 'application/vnd.github+json',   // API v3
//     },
//   })
//   if (!res.ok) throw new Error('GitHub email fetch failed')
//   return await res.json() as Array<{
//     email: string
//     primary: boolean
//     verified: boolean
//     visibility: 'public' | null
//   }>
// }

// const emails = await fetchGitHubEmails(accessToken)
// const primary = emails.find(e => e.primary && e.verified)

// console.log(primary?.email) // <- adresse principale, même si elle est privée
// const fallback = `${profile.id}+${profile.login}@users.noreply.github.com`;

export const githubRouter = router({
  githubStart: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/github/login',
        tags: ['auth'],
        summary: 'Login/Register via GitHub',
      },
    })
    .input(z.object({}))
    .output(z.object({ redirectUrl: z.string() }))
    .mutation(async ({ ctx }) => {
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
    .mutation(async ({ ctx, input }) => {
      // if (input.state !== ctx.session.oauthState) throw new Error('Invalid OAuth state');

      // 2) échange code → token
      const token = await exchangeCodeForToken(input.code);
      const profile = await fetchGitHubProfile(token);
      console.log('GitHub profile:', profile);
      // 3) upsert user + clé API
      const user = await ctx.services.userService.createOrUpdateOAuthUser({
        provider: 'github',
        providerId: String(profile.id),
        email: profile.email,
      });
      const { key } = await ctx.services.apiKeyService.generateKey({
        userId: user.id,
        quota: 10,
      });

      // 4) session côté serveur
      setSession({ res: ctx.res, userId: user.id, ttl: '7d' });

      return { apiKey: key };
    }),
});
