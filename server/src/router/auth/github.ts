import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { env } from '../../env';
import { GitHubRequestFailedError } from '../../errors';
import { publicProcedure, router } from '../../middlewares';
import { setSession } from '../../utils/session';

/**
 * Makes a request to GitHub API
 * @param url - The GitHub API URL
 * @param init - Fetch options
 * @throws {GitHubRequestFailedError} When GitHub request fails
 */
async function githubRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(url, init);
  if (!r.ok) throw new GitHubRequestFailedError(url);
  return (await r.json()) as T;
}

async function exchangeCodeForToken(code: string) {
  const data = await githubRequest<{ access_token: string }>(
    'https://github.com/login/oauth/access_token',
    {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    },
  );
  return data.access_token;
}

async function fetchProfile(token: string) {
  return await githubRequest<{
    id: number;
    email: string | null;
    login: string;
    avatar_url: string;
  }>('https://api.github.com/user', { headers: { Authorization: `Bearer ${token}` } });
}

async function fetchEmails(token: string) {
  return await githubRequest<Array<{ email: string; primary: boolean; verified: boolean }>>(
    'https://api.github.com/user/emails',
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    },
  );
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
    .mutation(async ({ ctx }) => {
      if (!env.ENABLE_LOCAL_AUTH) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'GitHub authentication is currently disabled.',
        });
      }
      const redirectUrl = await ctx.fastify.githubOauth.generateAuthorizationUri(ctx.req, ctx.res);
      return { redirectUrl };
    }),

  githubCallback: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/auth/github/callback',
        tags: ['auth'],
        summary: 'GitHub OAuth Callback',
      },
    })
    .input(z.object({ code: z.string(), state: z.string() }))
    .output(z.object({ apiKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // if (input.state !== ctx.session.oauthState) throw new Error('Invalid OAuth state');
      if (!env.ENABLE_LOCAL_AUTH) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'GitHub authentication is currently disabled.',
        });
      }
      const token = await exchangeCodeForToken(input.code);
      const profile = await fetchProfile(token);
      let email = profile.email;
      const avatarUrl = profile.avatar_url;
      if (!email) {
        const emails = await fetchEmails(token);
        const primary = emails.find((e) => e.primary && e.verified);
        email = primary?.email ?? `${profile.id}+${profile.login}@users.noreply.github.com`;
      }
      const user = await ctx.services.userService.createOrUpdateOAuthUser({
        provider: 'github',
        providerId: String(profile.id),
        email,
        avatarUrl,
      });
      const { key } = await ctx.services.apiKeyService.generateKey({
        userId: user.id,
        quota: 10,
      });

      setSession({ res: ctx.res, userId: user.id, ttl: '7d' });

      return { apiKey: key };
    }),
});
