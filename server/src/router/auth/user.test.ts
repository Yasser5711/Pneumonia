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
});

describe('userRouter', () => {
  it('me → return user info', async () => {
    const fakeMe = {
      user: { id: 'u-42', email: 'john@example.com' },
      // keys: [],
      quota: { used: 10, total: 0 },
    };
    mockServices.userService.getMe.mockResolvedValue(fakeMe);

    const caller = createTestCaller({});
    const res = await caller.auth.user.me({});
    expect(res).toEqual(fakeMe);
    expect(mockServices.userService.getMe).toHaveBeenCalledWith('u-42');
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
    mockServices.apiKeyService.generateKey.mockResolvedValue({ key: 'new-api-key' } as any);

    const caller = createTestCaller({});
    const res = await caller.auth.user.generateMyKey({});

    expect(res).toEqual({ apiKey: 'new-api-key' });
    expect(mockServices.apiKeyService.generateKey).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u-42' }),
    );
  });
});
