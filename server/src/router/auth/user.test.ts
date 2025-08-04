import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestCaller } from '../../../test/caller';
import { mockServices } from '../../../test/services';
import { env } from '../../env';
vi.mock('../../utils/session', () => {
  const clearSession = vi.fn();
  return {
    getSession: () => ({ sub: 'u-42' }),
    setSession: vi.fn(),
    clearSession,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  env.ENABLE_LOCAL_AUTH = true;
  mockServices.userService.findById.mockResolvedValue({
    id: 'u-42',
    email: 'john@example.com',
  });
  mockServices.newUserService.findById.mockResolvedValue({
    id: 'fake-id',
    name: 'fake-name',
    email: 'fake-email@example.com',
    createdAt: new Date(),
    updatedAt: null,
    firstName: 'fake-first-name',
    lastName: 'fake-last-name',
    emailVerified: true,
    image: 'fake-image-url',
    requestsQuota: 100,
    requestsUsed: 50,
    lastLoginAt: null,
    lastLoginIp: null,
    apiKeys: [
      {
        id: 'fake-key-id',
        name: 'fake-key-name',
        prefix: null,
        start: null,
        key: 'fake-key',
        userId: 'fake-id',
        refillInterval: 60,
        refillAmount: 1,
        metadata: null,
        createdAt: new Date(),
        updatedAt: null,
        expiresAt: null,
        lastRefillAt: null,
        enabled: true,
        rateLimitEnabled: true,
        rateLimitTimeWindow: 60,
        remaining: 50,
        lastRequest: new Date(),
        permissions: '',
        rateLimitMax: 60,
        requestCount: 0,
      },
    ],
  });
  mockServices.newUserService.updateProfile.mockResolvedValue({
    id: 'fake-id',
    name: 'fake-name',
    email: 'fake-email@example.com',
    createdAt: new Date(),
    updatedAt: null,
    firstName: 'fake-first-name',
    lastName: 'fake-last-name',
    emailVerified: true,
    image: 'fake-image-url',
    requestsQuota: 100,
    requestsUsed: 50,
    lastLoginAt: null,
    lastLoginIp: null,
  });
});

describe('userRouter', () => {
  it('me → return user info', async () => {
    const fakeMe = {
      user: {
        id: 'test-user-123',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: null,
        lastLoginAt: null,
        lastLoginIp: null,
        firstName: 'John',
        lastName: 'Doe',
        image: null,
        apiKey: null,
      },
      quota: {
        total: 0,
        used: 0,
      },
    };
    mockServices.newUserService.getMe.mockResolvedValue(fakeMe);

    const caller = createTestCaller({
      customSession: { isAuthenticated: true, userId: 'test-user-123' },
    });
    const res = await caller.auth.user.me({});
    expect(res).toEqual(fakeMe);
    expect(mockServices.newUserService.getMe).toHaveBeenCalledWith('test-user-123');
  });

  it('logout → clears the cookie and returns success', async () => {
    const caller = createTestCaller({});
    const result = await caller.auth.user.logout({});

    expect(result).toEqual({ success: true });
  });
  it('logout → throws if local auth is disabled', async () => {
    env.ENABLE_LOCAL_AUTH = false;
    const caller = createTestCaller({});
    await expect(caller.auth.user.logout({})).rejects.toThrow('Router is currently disabled.');
  });

  it('generateMyKey → creates a key for the current user', async () => {
    mockServices.newApiKeyService.generateKey.mockResolvedValue({
      key: 'new-api-key',
      id: 'new-api-key-id',
    });

    const caller = createTestCaller({
      customSession: { isAuthenticated: true, userId: 'test-user-123' },
    });
    const res = await caller.auth.user.generateMyKey({});

    expect(res).toEqual({ apiKey: 'new-api-key' });
    expect(mockServices.newApiKeyService.generateKey).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'test-user-123' }),
    );
  });
});
