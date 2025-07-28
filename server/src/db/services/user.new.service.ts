import type { Repositories } from '../repositories/index';
type UserOutput = {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date | null;
  firstName: string;
  lastName: string;
  image: string | null;
  quota: {
    used: number;
    total: number;
  };
};
export const createNewUserService = (repo: Repositories['newUsersRepo']) => ({
  findById: async ({ id, includeApiKeys = false }: { id: string; includeApiKeys?: boolean }) => {
    return await repo.findById({ id, includeApiKeys });
  },

  /**
   * Get the current user's profile information
   * @param userId - The ID of the user to retrieve
   */
  getMe: async (userId: string): Promise<UserOutput> => {
    const user = await repo.findById({ id: userId, includeApiKeys: true });
    if (!user) {
      throw new Error('User not found');
    }
    return {
      ...user,
      quota: { total: user.requestsQuota, used: user.requestsUsed },
    };
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
