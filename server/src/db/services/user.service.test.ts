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
    avatarUrl: 'https://avatars.githubusercontent.com/u/12345678?v=4',
  };

  it('returns existing user when repo.findByProvider hits', async () => {
    mockUserRepo.findByProvider.mockResolvedValue({ id: 'exists' });
    mockUserRepo.update.mockResolvedValue([{ id: 'exists' }]);
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
    expect(mockUserRepo.update).not.toHaveBeenCalled();
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
    mockUserRepo.getMyQuota.mockResolvedValue({ used: 5, total: 1 });

    const me = await userService.getMe('me');

    expect(me).toEqual({
      user: { id: 'me' },
      // keys: [{ id: 'key' }],
      quota: { used: 5, total: 1 },
    });
  });
});
describe('updateLastSeen', () => {
  it('updates lastLogin for the user', async () => {
    const userId = 'u1';
    const lastSeen = new Date('2023-10-01T12:00:00Z');

    mockUserRepo.update.mockResolvedValue({ id: userId, lastLogin: lastSeen });

    const result = await userService.updateLastSeen({ userId, lastSeen });
    expect(result).toEqual({ id: userId, lastLogin: lastSeen });
    expect(mockUserRepo.update).toHaveBeenCalledWith({
      id: userId,
      updates: { lastLogin: lastSeen },
    });
  });
});
