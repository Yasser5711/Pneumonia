// test/setup.ts
import { afterAll, beforeAll, vi } from 'vitest';

beforeAll(() => {
  console.log('🧪 Test suite starting...');
  process.env.API_KEY = 'test_api_key';
  vi.mock('axios', async () => {
    return {
      default: {
        post: vi.fn(() =>
          Promise.resolve({
            data: {
              probability_pneumonia: 0.42,
              label: 'Normal',
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
  console.log('✅ All tests done');
});

// Mock global modules here if needed
// Example: vi.mock('axios')
