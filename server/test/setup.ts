import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { setLogger } from '../src/logger';

import { FastifyBaseLogger } from 'fastify';

const mockLogger = mockDeep<FastifyBaseLogger>();
beforeAll(() => {
  setLogger(mockLogger);

  vi.mock('../src/env', () => ({
    env: {
      NODE_ENV: 'test',
      API_KEY: 'test_api_key',
      CNN_PREDICT_URL: 'http://localhost:8000/predict',
    },
  }));
  // eslint-disable-next-line no-console
  console.log('🧪 Test suite starting...');
  vi.mock('axios', async () => {
    return {
      default: {
        post: vi.fn(() =>
          Promise.resolve({
            data: {
              data: {
                model: 'yassermekhfi/pneumonia',
                model_version: 'latest',
                prediction: {
                  class: 'Normal',
                  probability: 0.42,
                },
              },
            },
          }),
        ),
      },
    };
  });
  vi.mock('sharp', async () => {
    return {
      default: () => ({
        resize: () => ({
          raw: () => ({
            toBuffer: () =>
              Promise.resolve({
                data: new Uint8Array(128 * 128 * 3), // valid RGB buffer
              }),
          }),
        }),
      }),
    };
  });
});
afterEach(() => {
  mockReset(mockLogger);
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
afterAll(() => {
  // eslint-disable-next-line no-console
  console.log('✅ All tests done');
});
