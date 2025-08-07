import { beforeEach, describe, expect, it } from 'vitest';

import { createTestCaller } from '../../test/caller';
import { mockNewUserService } from '../../test/services';
beforeEach(() => {
  mockNewUserService.findById.mockResolvedValue({
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
    normalizedEmail: 'fake-email@example.com',
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
  mockNewUserService.updateProfile.mockResolvedValue({
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
    normalizedEmail: 'fake-email@example.com',
  });
});

describe('helloWorldRouter', () => {
  it('returns default greeting when name omitted', async () => {
    const caller = createTestCaller({
      customSession: { isAuthenticated: true, userId: 'test-user-123' },
    });
    const result = await caller.helloWorldRouter({});
    expect(result).toEqual({ message: 'Hello, Guest!' });
  });

  it('returns personalized greeting when name provided', async () => {
    const caller = createTestCaller({
      customSession: { isAuthenticated: true, userId: 'test-user-123' },
    });
    const result = await caller.helloWorldRouter({ name: 'John' });
    expect(result).toEqual({ message: 'Hello, John!' });
  });

  it('returns Not authenticated error when session is not authenticated', async () => {
    const caller = createTestCaller({ customSession: null });
    await expect(caller.helloWorldRouter({ name: 'John' })).rejects.toThrow('Session not found');
  });
});
