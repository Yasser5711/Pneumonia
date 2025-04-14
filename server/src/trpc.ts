import { inferAsyncReturnType, initTRPC, TRPCError } from '@trpc/server';
import { FastifyRequest } from 'fastify';
export const createContext = ({ req }: { req: FastifyRequest }) => {
  return {
    apiKey: req.headers['x-api-key'] as string | undefined,
  };
};
type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// eslint-disable-next-line no-unused-vars
const isProd = process.env.NODE_ENV === 'production';

const requireAuth = t.middleware(({ ctx, next }) => {
  const expectedApiKey = process.env.API_KEY || 'my-secret-api-key';
  if (!ctx.apiKey || ctx.apiKey !== expectedApiKey) {
    console.warn('🚫 Invalid API key attempt:', ctx.apiKey);
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid API key' });
  }

  return next();
});

export const protectedProcedure = t.procedure.use(requireAuth);
