import { type inferAsyncReturnType, initTRPC, TRPCError } from '@trpc/server';
import { type FastifyRequest } from 'fastify';
import { env } from './env';
import { logger } from './logger';
export const createContext = ({ req }: { req: FastifyRequest }) => {
  return {
    apiKey: req.headers['x-api-key'] as string | undefined,
  };
};
type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const requireAuth = t.middleware(({ ctx, next }) => {
  const expectedApiKey = env.API_KEY;
  if (!ctx.apiKey || ctx.apiKey !== expectedApiKey) {
    logger().warn('🚫 Invalid API key attempt:', ctx.apiKey);
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid API key' });
  }

  return next();
});

export const protectedProcedure = t.procedure.use(requireAuth);
