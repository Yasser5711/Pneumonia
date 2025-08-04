import {
  ApiKeyGenerationFailedError,
  ApiKeyInvalidError,
  ApiKeyQuotaExceededError,
  ApiKeyQuotaNotSetError,
  ApiKeyVerificationFailedError,
  NoApiKeyFoundForUserError,
} from '../../errors';
import { auth } from '../../utils/auth';

import type { Repositories } from '../repositories/index';
export const createNewApiKeyService = (repo: Repositories['newApiKeysRepo']) => ({
  /**
   * Generate a new API key for a user using better-auth.
   * @param userId - The UUID of the user.
   * @param name - Optional name for the API key.
   * @param expiresIn - Optional expiration time in seconds (default is 30 days).
   * @returns The generated API key.
   * @throws {ApiKeyGenerationFailedError} When API key generation fails
   */
  generateKey: async ({
    userId,
    name,
    expiresIn = 30 * 24 * 60 * 60,
  }: {
    userId: string;
    name?: string;
    expiresIn?: number;
  }) => {
    try {
      return await repo.create({ userId, name, expiresIn });
    } catch (error) {
      throw new ApiKeyGenerationFailedError((error as Error).message);
    }
  },

  /**
   * Validate an API key.
   * @param key - The API key to validate.
   * @returns The validated API key object.
   * @throws {ApiKeyVerificationFailedError} When API key verification fails
   * @throws {ApiKeyInvalidError} When API key is invalid
   * @throws {ApiKeyQuotaNotSetError} When API key quota is not set
   * @throws {ApiKeyQuotaExceededError} When API key quota is exceeded
   */
  verifyKey: async (key: string) => {
    let res;
    try {
      res = await auth.api.verifyApiKey({ body: { key } });
    } catch (error) {
      throw new ApiKeyVerificationFailedError((error as Error).message);
    }
    if (!res || !res.key || !res.valid) {
      throw new ApiKeyInvalidError();
    }
    const { requestsQuota, requestsUsed, userId } = await repo.getQuota(res.key.id);

    if (requestsQuota == null) {
      throw new ApiKeyQuotaNotSetError();
    }

    if ((requestsUsed ?? 0) >= requestsQuota) {
      throw new ApiKeyQuotaExceededError();
    }

    return { ...res, userId };
  },
  /**
   * Get my API key.
   * @param userId - The UUID of the user.
   * @returns The user's API key.
   * @throws {NoApiKeyFoundForUserError} When no API key is found for the user
   */
  getMyKey: async (userId: string) => {
    const key = await repo.findByUserId({ userId });
    if (!key || key.length === 0) {
      throw new NoApiKeyFoundForUserError();
    }
    return key[0];
  },
  // /**
  //  * List keys for a user (for a management UI).
  //  */
  // listUserKeys: async (userId: string) => {
  //   return await repo.findByUserId(userId);
  // },

  // /**
  //  * Revoke (delete) an API key.
  //  */
  // revokeKey: async (keyId: string) => {
  //   return await repo.delete(keyId);
  // },

  // /**
  //  * Update key metadata (e.g., rename the key or disable it).
  //  */
  // updateKey: async (keyId: string, updates: { name?: string; enabled?: boolean }) => {
  //   return await repo.update({ id: keyId, updates });
  // },
});
