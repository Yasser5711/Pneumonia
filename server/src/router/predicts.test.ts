import { env } from '@env';
import { createTestCaller } from '@tests/caller';
import { mockApiKeyService } from '@tests/services';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
let originalEnv: typeof env;
vi.unmock('../src/middlewares/auth.middleware.ts');
beforeEach(() => {
  originalEnv = { ...env };
  mockApiKeyService.validateKey.mockResolvedValue({
    id: 'fake-id',
    name: 'Fake Key',
    keyPrefix: 'prefix',
    hashedKey: 'hash',
    active: true,
    expiresAt: null,
    description: 'test',
    lastUsedAt: null,
    lastUsedIp: null,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  Object.assign(env, originalEnv); // reset env
});
describe('🧪 API key auth', () => {
  it('fails with invalid key', async () => {
    mockApiKeyService.validateKey.mockResolvedValue(null);
    const caller = createTestCaller();
    await expect(
      caller.predictPneumonia({ imageBase64: 'data:image/png;base64,...' }),
    ).rejects.toThrow('Invalid or expired API key');
  });

  it('passes with valid key', async () => {
    const caller = createTestCaller();

    await expect(
      caller.predictPneumonia({ imageBase64: 'data:image/png;base64,A==' }),
    ).resolves.toEqual({
      model: 'yassermekhfi/pneumonia',
      model_version: 'latest',
      prediction: {
        class: 'Normal',
        probability: 0.42,
      },
    });
  });
  it('fails when CNN_PREDICT_URL is missing', async () => {
    env.CNN_PREDICT_URL = undefined as unknown as string;
    const caller = createTestCaller();
    await expect(
      caller.predictPneumonia({ imageBase64: 'data:image/png;base64,A==' }),
    ).rejects.toThrow('CNN_PREDICT_URL is not set');

    vi.restoreAllMocks();
  });
  it('fails when post request fails', async () => {
    const postSpy = vi.spyOn(axios, 'post');
    postSpy.mockRejectedValueOnce(new Error('Error in CNN prediction'));
    const caller = createTestCaller();
    await expect(
      caller.predictPneumonia({ imageBase64: 'data:image/png;base64,A==' }),
    ).rejects.toThrow('Error in CNN prediction');
    vi.resetModules();
  });
});
