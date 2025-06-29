import type { Repositories } from '../repositories/index';

export const createUserService = (repo: Repositories['usersRepo']) => ({
  findById: async (id: string) => {
    return await repo.findById(id);
  },
  createOrUpdateOAuthUser: async ({
    provider,
    providerId,
    email,
  }: {
    provider: 'github' | 'google';
    providerId: string;
    email: string | null;
  }) => {
    let user = await repo.findByProvider({ provider, providerId });
    if (!user) {
      const [created] = await repo.create({ provider, providerId, email });
      user = created;
    }
    return user;
  },

  upgradeQuota: async ({ id, quota = 10 }: { id: string; quota?: number }) => {
    return await repo.upgradeQuota({ id, quota });
  },

  getMe: async (userId: string) => {
    return {
      user: await repo.findById(userId),
      keys: await repo.getMyKeys(userId),
      quota: await repo.getMyQuota(userId),
    };
  },
  updateLastSeen: async ({ userId, lastSeen }: { userId: string; lastSeen: Date }) => {
    return await repo.update({ id: userId, updates: { lastLogin: lastSeen } });
  },
});
// TODO: add https://orm.drizzle.team/docs/typebox types for the service methods
