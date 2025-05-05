import { describe, expect, it } from 'vitest';
import { compareApiKey, hashApiKey } from './hash';

describe('hash utils', () => {
  const rawKey = 'my-secret-api-key';

  it('should hash a key and not return the original', async () => {
    const hash = await hashApiKey(rawKey);
    expect(hash).not.toBe(rawKey);
    expect(hash).toMatch(/^\$2[aby]\$.{56}$/);
  });

  it('should return true when comparing correct key', async () => {
    const hash = await hashApiKey(rawKey);
    const isValid = await compareApiKey(rawKey, hash);
    expect(isValid).toBe(true);
  });

  it('should return false when comparing wrong key', async () => {
    const hash = await hashApiKey(rawKey);
    const isValid = await compareApiKey('wrong-key', hash);
    expect(isValid).toBe(false);
  });
});
