import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';

import { setLogger } from '../src/logger';

import type { FastifyBaseLogger } from 'fastify';

export const mockLogger = mockDeep<FastifyBaseLogger>();
beforeAll(() => {
  setLogger(mockLogger);
  vi.mock('../src/env', () => ({
    env: {
      NODE_ENV: 'test',
      CNN_PREDICT_URL: 'http://localhost:8000/predict',
      GITHUB_CLIENT_ID: 'test_client_id',
      GITHUB_CLIENT_SECRET: 'test_client_secret',
      GOOGLE_CLIENT_ID: 'test_google_client_id',
      GOOGLE_CLIENT_SECRET: 'test_google_client_secret',
      SESSION_SECRET: 'test_session_secret',
      ENABLE_LOCAL_AUTH: true,
      BASE_URL: 'http://localhost:3000',
    },
  }));
});

afterEach(() => {
  mockReset(mockLogger);
  // resetRateLimit();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
afterAll(() => {});
