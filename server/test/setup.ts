import { afterAll, beforeAll, vi } from 'vitest';

beforeAll(() => {
  // eslint-disable-next-line no-console
  console.log('🧪 Test suite starting...');
  process.env.API_KEY = 'test_api_key';
  vi.mock('axios', async () => {
    return {
      default: {
        post: vi.fn(() =>
          Promise.resolve({
            data: {
              model: 'yassermekhfi/pneumonia',
              model_version: 'latest',
              prediction: {
                class: 'Normal',
                probability: 0.42,
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

afterAll(() => {
  // eslint-disable-next-line no-console
  console.log('✅ All tests done');
});
