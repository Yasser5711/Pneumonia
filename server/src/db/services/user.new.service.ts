import type { createNewApiKeyService } from './apiKey.new.service';
import type { Repositories } from '../repositories/index';
type UserOutput = {
  user: {
    id: string;
    name: string | null;
    email: string;
    createdAt: Date;
    updatedAt: Date | null;
    firstName: string;
    lastName: string;
    image: string | null;
    apiKey?: string | null;
  };
  quota: {
    used: number;
    total: number;
  };
};
export const createNewUserService = (
  repo: Repositories['newUsersRepo'],
  apiKeyService: ReturnType<typeof createNewApiKeyService>,
) => ({
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
    let apiKey: string | null = user.apiKeys?.[0]?.key || null;
    if (!apiKey) {
      const generated = await apiKeyService.generateKey({ userId });
      apiKey = generated.key;
    }
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        apiKey: apiKey || null,
      },
      quota: {
        total: user.requestsQuota,
        used: user.requestsUsed,
      },
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
