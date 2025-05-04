import type { FastifyRequest } from 'fastify';
import { mockDeep } from 'vitest-mock-extended';
import { appRouter } from '../src/router/_app';
const MOCK_API_KEY = 'test_api_key';
const req = mockDeep<FastifyRequest>();
export function createTestCaller(apiKey = MOCK_API_KEY) {
  return appRouter.createCaller({
    apiKey,
    req,
  });
}
