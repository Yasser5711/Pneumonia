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
    await expect(
      caller.predictPneumonia({ imageBase64: 'data:image/png;base64,A==' }),
    ).resolves.toEqual({
      probability_pneumonia: 0.42,
      label: 'Normal',
    });
  });
});
