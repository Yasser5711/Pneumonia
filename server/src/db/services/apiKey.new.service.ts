import { auth } from '../../utils/auth';

import type { Repositories } from '../repositories/index';
export const createNewApiKeyService = (repo: Repositories['newApiKeysRepo']) => ({
  /**
   * Generate a new API key for a user using better-auth.
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
      throw new Error(`Failed to generate API key: ${(error as Error).message}`);
    }
  },

  /**
   * Validate an API key. This is typically called by your tRPC middleware.
   */
  verifyKey: async (key: string) => {
    let res;
    try {
      res = await auth.api.verifyApiKey({ body: { key } });
    } catch (error) {
      throw new Error(`Failed to verify API key: ${(error as Error).message}`);
    }
    if (!res || !res.key || !res.valid) {
      throw new Error('Invalid API key');
    }
    const { requestsQuota, requestsUsed, userId } = await repo.getQuota(res.key.id);

    if (requestsQuota == null) {
      throw new Error('API key quota not set');
    }

    if ((requestsUsed ?? 0) >= requestsQuota) {
      throw new Error('API key quota exceeded');
    }

    return { ...res, userId };
  },
  /**
   * Get my API key.
   */
  getMyKey: async (userId: string) => {
    const key = await repo.findByUserId({ userId });
    if (!key) {
      throw new Error('No API key found for this user');
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
