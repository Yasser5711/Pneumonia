import { initTRPC } from '@trpc/server';
import type { FastifyRequest } from 'fastify';
export const createContext = ({ req }: { req: FastifyRequest }) => {
  return {
    apiKey: req.headers['x-api-key'] as string | undefined,
    req,
  };
};
type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create();
