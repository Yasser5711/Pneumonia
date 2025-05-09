import type { OpenApiMeta } from '@9or9/trpc-openapi';
import { initTRPC } from '@trpc/server';
import type { FastifyRequest } from 'fastify';
import type { Services } from './db/services/index';
import * as defaultServices from './db/services/index';
export const createContext = ({ req, services }: { req: FastifyRequest; services?: Services }) => {
  return {
    apiKey: req.headers['x-api-key'] as string | undefined,
    services: services ?? defaultServices,
    req,
  };
};
type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.meta<OpenApiMeta>().context<Context>().create();
