import type { Repositories } from '../repositories/index';

export const createNewUserService = (repo: Repositories['newUsersRepo']) => ({
  findById: async ({ id, includeApiKeys = false }: { id: string; includeApiKeys?: boolean }) => {
    return await repo.findById({ id, includeApiKeys });
  },

  /**
   * Get the current user's profile information
   * @param userId - The ID of the user to retrieve
   */
  getMe: async (userId: string) => {
    const user = await repo.findById({ id: userId, includeApiKeys: true });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  updateProfile: async (
    userId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      image?: string;
      requestsQuota?: number;
      requestsUsed?: number;
    },
  ) => {
    return await repo.update({ id: userId, updates });
  },
  updateQuota: async (userId: string) => {
    await repo.updateQuota(userId);
  },
});
