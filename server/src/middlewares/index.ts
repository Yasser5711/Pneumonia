import { t } from '../trpc';
import { requireAuth } from './auth.middleware';

export const router = t.router;
// ts-prune-ignore-next
export const publicProcedure = t.procedure;
export const protectedProcedureAPI = t.procedure.use(requireAuth);
