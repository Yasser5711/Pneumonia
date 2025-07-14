import { mockDeep } from 'vitest-mock-extended';

import { appRouter } from '../src/router/_app';

import { mockServices } from './services';

import type { auth } from '../src/utils/auth';
import type { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';
const MOCK_API_KEY = 'test_api_key';
// const req = mockDeep<FastifyRequest>();
// const res = mockDeep<FastifyReply>();
// const fastify = mockDeep<FastifyInstance>();
const session = mockDeep<Awaited<ReturnType<typeof auth.api.getSession>>>();

export function createTestCaller({
  apiKey = MOCK_API_KEY,
  req = mockDeep<FastifyRequest>(),
  res = mockDeep<FastifyReply>(),
  fastify = mockDeep<FastifyInstance>(),
}: {
  apiKey?: string;
  req?: FastifyRequest;
  res?: FastifyReply;
  fastify?: FastifyInstance;
}) {
  return appRouter.createCaller({
    apiKey,
    req,
    res,
    fastify,
    services: mockServices,
    session,
  });
}
