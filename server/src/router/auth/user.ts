import { z } from 'zod';
import { router, publicProcedure, protectedUserProcedure } from '../../middlewares';
import { setSession, clearSession } from '../../utils/session';

export const authRouter = router({
  me: protectedUserProcedure.query(({ ctx }) => ctx.user),
  logout: protectedUserProcedure.mutation(({ ctx }) => {
    clearSession(ctx.res);
  }),
});
