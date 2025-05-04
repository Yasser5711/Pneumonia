import { requireAuth } from '@middlewares/auth.middleware';
import { t } from '../trpc';

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedureAPI = t.procedure.use(requireAuth);
