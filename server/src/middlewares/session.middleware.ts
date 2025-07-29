import { TRPCError } from '@trpc/server';

import { t } from '../trpc';
import { getSession } from '../utils/session';
// import * as error from '../errors/session.errors';
export const sessionMiddleware = t.middleware(async ({ ctx, next }) => {
  const session = getSession(ctx.req);
  if (!session) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not logged in' });
  }
  const user = await ctx.services.userService.findById(session.sub);
  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found' });
  }
  await ctx.services.userService.updateLastSeen({ userId: user.id, lastSeen: new Date() });
  return next({ ctx: { ...ctx, user } });
});

export const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
  const userId = ctx.session?.userId;
  if (!userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid session (no user id)' });
  }
  return next({
    ctx: { ...ctx, userId },
  });
});
