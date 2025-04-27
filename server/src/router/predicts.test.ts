import { describe, expect, it } from 'vitest';
import { createTestCaller } from '../../test/caller';

describe('🧪 API key auth', () => {
  it('fails with invalid key', async () => {
    const caller = createTestCaller('wrong_key');
    await expect(
      caller.predictPneumonia({ imageBase64: 'data:image/png;base64,...' }),
    ).rejects.toThrow('Invalid API key');
  });

  it('passes with valid key', async () => {
    const caller = createTestCaller();
    // eslint-disable-next-line no-console
    console.log(await caller.predictPneumonia({ imageBase64: 'data:image/png;base64,A==' }));
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
    const originalEnv = process.env.CNN_PREDICT_URL;
    delete process.env.CNN_PREDICT_URL;

    const caller = createTestCaller();
    await expect(
      caller.predictPneumonia({ imageBase64: 'data:image/png;base64,A==' }),
    ).rejects.toThrow('CNN_PREDICT_URL is not set');

    process.env.CNN_PREDICT_URL = originalEnv;
  });
});
