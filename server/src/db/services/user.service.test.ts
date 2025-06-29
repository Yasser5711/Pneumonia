import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockUserRepo } from '../../../test/repositories';

import { createUserService } from './user.service';

const userService = createUserService(mockUserRepo);

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe('findById', () => {
  it('delegates straight to repo.findById', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'u1' });
    const user = await userService.findById('u1');
    expect(user).toEqual({ id: 'u1' });
    expect(mockUserRepo.findById).toHaveBeenCalledWith('u1');
  });
});

describe('createOrUpdateOAuthUser', () => {
  const input = {
    provider: 'github' as const,
    providerId: '123',
    email: 'g@hub.com',
  };

  it('returns existing user when repo.findByProvider hits', async () => {
    mockUserRepo.findByProvider.mockResolvedValue({ id: 'exists' });

    const result = await userService.createOrUpdateOAuthUser(input);
    expect(result).toEqual({ id: 'exists' });
    expect(mockUserRepo.create).not.toHaveBeenCalled();
  });

  it('creates a new user when none exists', async () => {
    mockUserRepo.findByProvider.mockResolvedValue(null);
    mockUserRepo.create.mockResolvedValue([{ id: 'new-user' }]);

    const result = await userService.createOrUpdateOAuthUser(input);
    expect(result).toEqual({ id: 'new-user' });
    expect(mockUserRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'github',
        providerId: '123',
        email: 'g@hub.com',
      }),
    );
  });
});

describe('upgradeQuota', () => {
  it('forwards the call to repo.upgradeQuota', async () => {
    mockUserRepo.upgradeQuota.mockResolvedValue({ freeRequestsQuota: 42 });

    const r = await userService.upgradeQuota({ id: 'u1', quota: 12 });
    expect(r.freeRequestsQuota).toBe(42);
    expect(mockUserRepo.upgradeQuota).toHaveBeenCalledWith({ id: 'u1', quota: 12 });
  });

  it('uses default +10 when quota not provided', async () => {
    await userService.upgradeQuota({ id: 'u1' });
    expect(mockUserRepo.upgradeQuota).toHaveBeenCalledWith({ id: 'u1', quota: 10 });
  });
});

describe('getMe', () => {
  it('returns user, keys and quota aggregated', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'me' });
    mockUserRepo.getMyKeys.mockResolvedValue([{ id: 'key' }]);
    mockUserRepo.getMyQuota.mockResolvedValue({ left: 5, used: 1 });

    const me = await userService.getMe('me');

    expect(me).toEqual({
      user: { id: 'me' },
      keys: [{ id: 'key' }],
      quota: { left: 5, used: 1 },
    });
  });
});
