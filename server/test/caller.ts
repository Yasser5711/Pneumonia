import type { FastifyReply, FastifyRequest } from 'fastify';
import { mockDeep } from 'vitest-mock-extended';
import { appRouter } from '../src/router/_app';
import { mockServices } from './services';
const MOCK_API_KEY = 'test_api_key';
const req = mockDeep<FastifyRequest>();
const res = mockDeep<FastifyReply>();
export function createTestCaller(apiKey = MOCK_API_KEY) {
  return appRouter.createCaller({
    apiKey,
    req,
    res,
    services: mockServices,
  });
}
