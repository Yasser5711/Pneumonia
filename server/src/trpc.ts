import { initTRPC } from '@trpc/server';

import * as defaultServices from './db/services/index';

import type { Services } from './db/services/index';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { OpenApiMeta } from 'trpc-to-openapi';

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
