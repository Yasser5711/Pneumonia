import { auth } from '../../utils/auth'; // Import the configured better-auth instance

import type { Repositories } from '../repositories/index';

export const createNewApiKeyService = (repo: Repositories['newApiKeysRepo']) => ({
  /**
   * Generate a new API key for a user using better-auth.
   */
  generateKey: async ({
    userId,
    name,
    expiresIn = '30d', // Default expiration (e.g., 30 days)
    permissions = [],
    rateLimit,
  }: {
    userId: string;
    name: string;
    expiresIn?: string;
    permissions?: string[];
    rateLimit?: { max: number; timeWindow: number };
  }) => {
    // Use the better-auth instance to generate and save the key
    const { apiKey, hashedKey } = await auth.apiKey.generate({
      userId,
      name,
      expiresIn,
      permissions,
      rateLimit,
    });

    // Return the plain text apiKey (only shown once) and the hashed metadata saved in the DB.
    return {
      plainTextKey: apiKey,
      meta: hashedKey,
    };
  },

  /**
   * Validate an API key. This is typically called by your tRPC middleware.
   */
  validateKey: async (plainTextKey: string) => {
    // Use better-auth to validate the key and check rate limits/expiration.
    const result = await auth.apiKey.validate(plainTextKey);
    return result;
  },

  /**
   * List keys for a user (for a management UI).
   */
  listUserKeys: async (userId: string) => {
    return await repo.findByUserId(userId);
  },

  /**
   * Revoke (delete) an API key.
   */
  revokeKey: async (keyId: string) => {
    return await repo.delete(keyId);
  },

  /**
   * Update key metadata (e.g., rename the key or disable it).
   */
  updateKey: async (keyId: string, updates: { name?: string; enabled?: boolean }) => {
    return await repo.update({ id: keyId, updates });
  },
});
