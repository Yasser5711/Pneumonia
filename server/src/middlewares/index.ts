import { t } from '../trpc';
import { requireAuth } from './auth.middleware';
import { sessionMiddleware } from './session.middleware';
// import { rateLimit } from './rateLimit.middleware';
export const router = t.router;
// ts-prune-ignore-next
export const publicProcedure = t.procedure;
export const protectedUserProcedure = t.procedure.use(sessionMiddleware);
export const protectedProcedureAPI = t.procedure.use(requireAuth);
// export const protectedProcedureAPIWithRateLimit = t.procedure.use(rateLimit);
