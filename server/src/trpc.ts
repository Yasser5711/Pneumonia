import type { OpenApiMeta } from '@9or9/trpc-openapi';
import { initTRPC } from '@trpc/server';
import type { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';
import type { Services } from './db/services/index';
import * as defaultServices from './db/services/index';

export interface CreateContextOptions {
  req: FastifyRequest;
  res: FastifyReply;
  services?: Services;
  fastify: FastifyInstance;
}
export const createContext = (opts: CreateContextOptions) => {
  const { req, res, services, fastify } = opts;

  return {
    apiKey: req.headers['x-api-key'] as string | undefined,
    services: services ?? defaultServices,
    req,
    res,
    fastify,
  };
};
export type Context = Awaited<ReturnType<typeof createContext>>;
// export type AuthenticatedContext = Context & {
//   apiKeyRecord: Awaited<ReturnType<typeof defaultServices.apiKeyService.validateKey>>;
// };

export const t = initTRPC.meta<OpenApiMeta>().context<Context>().create();
