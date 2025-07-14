import { TRPCError } from '@trpc/server';

import { t } from '../trpc';

import { requireAuth } from './auth.middleware';
import { sessionMiddleware } from './session.middleware';

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
  return next({
    ctx: { ...ctx, session: ctx.session },
  });
});

export const router = t.router;
// ts-prune-ignore-next
export const publicProcedure = t.procedure;
export const protectedUserProcedure = t.procedure.use(sessionMiddleware);
export const protectedProcedureAPI = t.procedure.use(requireAuth);
// export const protectedProcedureAPIWithRateLimit = t.procedure.use(rateLimit);
export const protectedProcedure = t.procedure.use(isAuthed);
