import { beforeEach, describe, expect, it } from 'vitest';
import { createTestCaller } from '../../test/caller';
import { mockApiKeyService } from '../../test/services';

describe('hello world', () => {
  beforeEach(() => {
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
    mockApiKeyService.markKeyUsed.mockResolvedValue(undefined);
  });
  const caller = createTestCaller();

  it('should return hello world', async () => {
    const result = await caller.helloWorldRouter({});
    expect(result).toEqual({ message: 'Hello, Guest!' });
  });

  it('should return hello world with name', async () => {
    const result = await caller.helloWorldRouter({ name: 'John' });
    expect(result).toEqual({ message: 'Hello, John!' });
  });
  it('should throw unauthorized if no API key match', async () => {
    mockApiKeyService.validateKey.mockResolvedValue(null);

    const caller = createTestCaller();
    await expect(caller.helloWorldRouter({})).rejects.toThrow('Invalid or expired API key');
  });
});
