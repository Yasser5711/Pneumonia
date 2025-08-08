import { t } from '../trpc';

import { requireApiKey } from './auth.middleware';
import { sessionMiddleware, isAuthed } from './session.middleware';

export const router = t.router;
// ts-prune-ignore-next
export const publicProcedure = t.procedure;
/**
 * @deprecated Use `protectedProcedure` instead
 */
export const protectedUserProcedure = t.procedure.use(sessionMiddleware);
export const protectedProcedureAPI = t.procedure.use(requireApiKey);
// export const protectedProcedureAPIWithRateLimit = t.procedure.use(rateLimit);
export const protectedProcedure = t.procedure.use(isAuthed);
