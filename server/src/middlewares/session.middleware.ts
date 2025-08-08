import { TRPCError } from '@trpc/server';

import {
  SessionNotFoundError,
  SessionUserNotFoundError,
  SessionInvalidUserIdError,
} from '../errors';
import { t } from '../trpc';
import { getSession } from '../utils/session';
// import * as error from '../errors/session.errors';
/**
 * @deprecated
 */
export const sessionMiddleware = t.middleware(async ({ ctx, next }) => {
  const session = getSession(ctx.req);
  if (!session) {
    throw new TRPCError({ code: 'UNAUTHORIZED', cause: new SessionNotFoundError() });
  }

  const user = await ctx.services.userService.findById(session.sub);
  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', cause: new SessionUserNotFoundError() });
  }

  await ctx.services.userService.updateLastSeen({ userId: user.id, lastSeen: new Date() });

  return next({ ctx: { ...ctx, user } });
});

export const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED', cause: new SessionNotFoundError() });
  }

  const userId = ctx.session?.userId;
  if (!userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', cause: new SessionInvalidUserIdError() });
  }

  const user = await ctx.services.newUserService.findById({ id: userId });
  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', cause: new SessionUserNotFoundError() });
  }

  await ctx.services.newUserService.updateProfile(userId, { lastLoginIp: ctx.req.ip });

  return next({
    ctx: { ...ctx, userId, user },
  });
});
