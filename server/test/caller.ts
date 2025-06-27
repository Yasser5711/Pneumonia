import { mockDeep } from 'vitest-mock-extended';

import { appRouter } from '../src/router/_app';

import { mockServices } from './services';

import type { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';
const MOCK_API_KEY = 'test_api_key';
const req = mockDeep<FastifyRequest>();
const res = mockDeep<FastifyReply>();
const fastify = mockDeep<FastifyInstance>();
export function createTestCaller(apiKey = MOCK_API_KEY) {
  return appRouter.createCaller({
    apiKey,
    req,
    res,
    fastify,
    services: mockServices,
  });
}
