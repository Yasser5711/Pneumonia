// import { resetRateLimit } from 'src/middlewares/rateLimit.middleware';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestCaller } from '../../test/caller';
import { mockApiKeyService } from '../../test/services';
import { QuotaExceededError } from '../errors/apiKey.errors';
describe('hello world', () => {
  beforeEach(() => {
    // resetRateLimit();
    mockApiKeyService.validateKey.mockResolvedValue({
      id: 'fake-id',
      name: 'Fake Key',
      keyPrefix: 'prefix',
      hashedKey: 'hash',
      active: true,
      freeRequestsUsed: 0,
      freeRequestsQuota: 1,
      updatedAt: new Date(),
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
    mockApiKeyService.validateKey.mockRejectedValueOnce(new Error('Invalid or expired API key'));

    const caller = createTestCaller();
    await expect(caller.helloWorldRouter({})).rejects.toThrow('Invalid or expired API key');
  });
  it('should block (limit=1) quota exceeded', async () => {
    mockApiKeyService.validateKey.mockRejectedValueOnce(new QuotaExceededError(1));
    const caller = createTestCaller('my-api-key');
    await expect(caller.helloWorldRouter({})).rejects.toThrow('Rate limit exceeded');
  });
});
