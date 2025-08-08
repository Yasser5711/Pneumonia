import { UserNotFoundError } from '../../errors';

import type { createNewApiKeyService } from './apiKey.new.service';
import type { Repositories } from '../repositories/index';
type UserOutput = {
  user: {
    id: string;
    name: string | null;
    email: string;
    createdAt: Date;
    updatedAt: Date | null;
    lastLoginAt: Date | null;
    lastLoginIp: string | null;
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
  /**
   * Finds a user by their ID, optionally including their API keys.
   * @param id - The UUID of the user.
   * @param includeApiKeys - Whether to include the user's API keys in the result.
   * @returns The user object or undefined if not found.
   */
  findById: async ({ id, includeApiKeys = false }: { id: string; includeApiKeys?: boolean }) => {
    return await repo.findById({ id, includeApiKeys });
  },
  /**
   * Get the current user's profile information
   * @param userId - The UUID of the user.
   * @returns The user profile information including API key if available.
   * @throws {UserNotFoundError} When user is not found
   */
  getMe: async (userId: string): Promise<UserOutput> => {
    const user = await repo.findById({ id: userId, includeApiKeys: true });
    if (!user) {
      throw new UserNotFoundError();
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
        lastLoginAt: user.lastLoginAt,
        lastLoginIp: user.lastLoginIp,
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
  /**
   * Update the user's profile information
   * @param userId - The UUID of the user.
   * @param updates - The fields to update (e.g., firstName, lastName, image).
   * @returns The updated user profile.
   */
  updateProfile: async (
    userId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      image?: string;
      requestsQuota?: number;
      requestsUsed?: number;
      lastLoginAt?: Date;
      lastLoginIp?: string;
    },
  ) => {
    return await repo.update({ id: userId, updates });
  },
  /**
   * Update the user's API key quota
   * @param userId - The UUID of the user.
   * @returns The updated user's quota.
   */
  updateQuota: async (userId: string) => {
    await repo.updateQuota(userId);
  },
});
