import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestCaller } from '../../test/caller';
import { mockApiKeyService, mockUserService } from '../../test/services';
import { ApiKeyInvalidError, QuotaExceededError } from '../errors/apiKey.errors';
vi.mock('../utils/session', () => ({
  getSession: () => ({ sub: 'user-id' }),
  setSession: vi.fn(),
  clearSession: vi.fn(),
}));
beforeEach(() => {
  mockUserService.findById.mockResolvedValue({
    id: 'fake-id',
    email: 'fake-email@example.com',
  });
  mockApiKeyService.validateKey.mockResolvedValue({
    id: 'fake-id',
    name: 'user-fake-id-key',
    keyPrefix: 'pref',
    hashedKey: 'hash',
    active: true,
    freeRequestsUsed: 0,
    freeRequestsQuota: 1,
    updatedAt: new Date(),
    expiresAt: null,
    description: 'unit test key',
    lastUsedAt: null,
    lastUsedIp: null,
    userId: 'fake-id',
  });

  mockApiKeyService.markKeyUsed.mockResolvedValue(undefined);
});

describe('helloWorldRouter', () => {
  it('returns default greeting when name omitted', async () => {
    const caller = createTestCaller({});
    const result = await caller.helloWorldRouter({});
    expect(result).toEqual({ message: 'Hello, Guest!' });
  });

  it('returns personalized greeting when name provided', async () => {
    const caller = createTestCaller({});
    const result = await caller.helloWorldRouter({ name: 'John' });
    expect(result).toEqual({ message: 'Hello, John!' });
  });

  it('propagates API-key validation errors (invalid / expired)', async () => {
    mockApiKeyService.validateKey.mockRejectedValueOnce(new ApiKeyInvalidError());

    const caller = createTestCaller({});
    await expect(caller.helloWorldRouter({})).rejects.toThrow('Invalid API key');
  });

  it('propagates QuotaExceededError as “Rate limit exceeded”', async () => {
    mockApiKeyService.validateKey.mockRejectedValueOnce(new QuotaExceededError(1));

    const caller = createTestCaller({});
    await expect(caller.helloWorldRouter({})).rejects.toThrow('Rate limit exceeded');
  });
});
