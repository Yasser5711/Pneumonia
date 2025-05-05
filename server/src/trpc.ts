import * as defaultServices from '@services/index';
import { initTRPC } from '@trpc/server';
import type { FastifyRequest } from 'fastify';
export const createContext = ({
  req,
  services,
}: {
  req: FastifyRequest;
  services?: typeof import('@services/index');
}) => {
  return {
    apiKey: req.headers['x-api-key'] as string | undefined,
    services: services ?? defaultServices,
    req,
  };
};
type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create();
