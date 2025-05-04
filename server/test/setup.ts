import { hashApiKey } from '@utils/hash';
import { FastifyBaseLogger } from 'fastify';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { setLogger } from '../src/logger';
import { initTestDatabase } from './db';
const mockLogger = mockDeep<FastifyBaseLogger>();
beforeAll(async () => {
  setLogger(mockLogger);

  vi.mock('../src/db/index.ts', async () => {
    const actual = await vi.importActual('../src/db/index.ts');
    const testDb = await initTestDatabase();
    return {
      ...actual,
      db: testDb,
    };
  });

  const rawKey = 'test_api_key';
  const hashedKey = await hashApiKey(rawKey);
  const { apiKeysRepo } = await import('@repositories/apiKey.repository');
  await apiKeysRepo.create({
    name: 'Test Key',
    hashedKey,
    keyPrefix: rawKey.slice(0, 12),
  });
  vi.mock('@env', () => ({
    env: {
      NODE_ENV: 'test',
      API_KEY: 'test_api_key',
      CNN_PREDICT_URL: 'http://localhost:8000/predict',
      DATABASE_URL: 'postgres://test_user:test_password@localhost:5432/test_db',
      SALT_ROUNDS: 10,
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
