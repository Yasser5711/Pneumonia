import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestCaller } from '../../../test/caller';
import { mockServices } from '../../../test/services';

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

  mockServices.userService.findById.mockResolvedValue({
    id: 'u-42',
    email: 'john@example.com',
  });
});

describe('userRouter', () => {
  it('me → return user info', async () => {
    const fakeMe = {
      user: { id: 'u-42', email: 'john@example.com' },
      keys: [],
      quota: { left: 10, used: 0 },
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
