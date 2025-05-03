import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestCaller } from '../../test/caller';
import { env } from '../env';
let originalEnv: typeof env;

beforeEach(() => {
  // Deep clone env to reset later
  originalEnv = { ...env };
});

afterEach(() => {
  vi.restoreAllMocks();
  Object.assign(env, originalEnv); // reset env
});
describe('🧪 API key auth', () => {
  it('fails with invalid key', async () => {
    const caller = createTestCaller('wrong_key');
    await expect(
      caller.predictPneumonia({ imageBase64: 'data:image/png;base64,...' }),
    ).rejects.toThrow('Invalid API key');
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
