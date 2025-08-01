import { initTRPC } from '@trpc/server';
import SuperJSON from 'superjson';
import { ZodError } from 'zod';

import * as defaultServices from './db/services/index';
import { logger } from './logger';
import { auth } from './utils/auth';

import type { Services } from './db/services/index';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { OpenApiMeta } from 'trpc-to-openapi';
export interface CreateContextOptions {
  req: FastifyRequest;
  res: FastifyReply;
  services?: Services;
  fastify: FastifyInstance;
}
export const createContext = async (opts: CreateContextOptions) => {
  const { req, res, services, fastify } = opts;
  const headers = new Headers();
  if (req.headers) {
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        } else {
          headers.append(key, value.toString());
        }
      }
    });
  }
  const apiKey = req.headers['x-api-key'] as string | undefined;
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  headers.delete('x-api-key');
  const session = await auth.api.getSession({ headers });

  return {
    apiKey,
    services: services ?? defaultServices,
    req,
    res,
    fastify,
    session,
    logger,
  };
};
export type Context = Awaited<ReturnType<typeof createContext>>;
// export type AuthenticatedContext = Context & {
//   apiKeyRecord: Awaited<ReturnType<typeof defaultServices.apiKeyService.validateKey>>;
// };

export const t = initTRPC
  .meta<OpenApiMeta>()
  .context<Context>()
  .create({
    transformer: SuperJSON,
    errorFormatter: ({ shape, error }) => ({
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }),
  });
