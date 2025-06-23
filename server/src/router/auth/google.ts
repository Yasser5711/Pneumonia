import { z } from 'zod';
import { router, publicProcedure, protectedUserProcedure } from '../../middlewares';
import { setSession, clearSession } from '../../utils/session';

async function fetchGoogleProfile(token: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (await res.json()) as { sub: string; email: string };
}

export const authRouter = router({
  googleStart: publicProcedure.query(({ ctx }) =>
    ctx.fastify.googleOauth.generateAuthorizationUri(),
  ),
  googleCallback: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx }) => {
      const token = await ctx.fastify.googleOauth.getAccessTokenFromAuthorizationCodeFlow(ctx.req);
      const profile = await fetchGoogleProfile(token.access_token);
      const user = await ctx.services.userService.createOrUpdateOAuthUser(
        'google',
        profile.sub,
        profile.email,
      );
      const { key } = await ctx.services.apiKeyService.generateKey({ userId: user.id, quota: 10 });
      setSession(ctx.res, user.id, '7d');
      return { apiKey: key };
    }),
});
