import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import { FastifyRequest } from 'fastify';
export const createContext = ({ req }: { req: FastifyRequest }) => {
  return {
    apiKey: req.headers['x-api-key'] as string | undefined,
  };
};
type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
// export const publicProcedure = t.procedure;

// eslint-disable-next-line no-unused-vars
const isProd = process.env.NODE_ENV === 'production';
const expectedApiKey = process.env.API_KEY;

const requireAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.apiKey || ctx.apiKey !== expectedApiKey) {
    throw new Error('UNAUTHORIZED');
  }

  return next();
});

export const protectedProcedure = t.procedure.use(requireAuth);
