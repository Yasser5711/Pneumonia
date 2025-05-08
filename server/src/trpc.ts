import { OpenApiMeta } from '@9or9/trpc-openapi';
import { initTRPC } from '@trpc/server';
import type { FastifyRequest } from 'fastify';
import * as defaultServices from './db/services/index';
export const createContext = ({
  req,
  services,
}: {
  req: FastifyRequest;
  services?: typeof import('./db/services/index');
}) => {
  return {
    apiKey: req.headers['x-api-key'] as string | undefined,
    services: services ?? defaultServices,
    req,
  };
};
type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.meta<OpenApiMeta>().context<Context>().create();
