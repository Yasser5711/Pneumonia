import { randomBytes } from 'crypto';

import { ApiKeyGenerationError } from '../../errors';
import * as apiKeyErrors from '../../errors';
import { logger } from '../../logger';
import { compareApiKey, hashApiKey } from '../../utils/hash';

import type { Repositories } from '../repositories/index';
/**
 * @deprecated
 */
export const createApiKeyService = (apiKeysRepo: Repositories['apiKeysRepo']) => ({
  generateKey: async ({
    userId,
    name,
    description,
  }: {
    userId: string;
    name?: string;
    description?: string;
    quota?: number;
  }) => {
    const rawKey = randomBytes(32).toString('hex');
    const prefix = rawKey.slice(0, 12);
    const secretPart = rawKey.slice(12);
    const hashed = await hashApiKey(secretPart);
    const record = await apiKeysRepo.create({
      name: name ?? `user-${userId}-key`,
      description,
      userId,
      keyPrefix: prefix,
      hashedKey: hashed,
    });

    if (!record) {
      logger().error(`API key insert failed, { name: ${name}, description: ${description} }`);
      throw new ApiKeyGenerationError();
    }

    return {
      key: rawKey,
      meta: record,
    };
  },
  validateKey: async (rawKey: string) => {
    if (!rawKey || rawKey.length <= 12) {
      throw new apiKeyErrors.ApiKeyInvalidError();
    }

    const prefix = rawKey.slice(0, 12);
    const secretPart = rawKey.slice(12);

    const candidates = await apiKeysRepo.findByPrefix(prefix);

    if (candidates.length === 0) {
      throw new apiKeyErrors.ApiKeyNotFoundError();
    }
    const now = new Date();
    for (const candidate of candidates) {
      const { id, hashedKey, active, expiresAt, freeRequestsUsed, freeRequestsQuota } = candidate;
      const isMatch = await compareApiKey(secretPart, hashedKey);
      if (!isMatch) {
        continue;
      }
      if (!active) {
        throw new apiKeyErrors.ApiKeyInactiveError();
      }
      if (expiresAt && expiresAt <= now) {
        await apiKeysRepo.invalidateKey(id);
        throw new apiKeyErrors.ApiKeyExpiredError();
      }
      if (freeRequestsUsed >= freeRequestsQuota) {
        throw new apiKeyErrors.QuotaExceededError(freeRequestsQuota);
      }
      return candidate;
    }

    throw new apiKeyErrors.ApiKeyInvalidError();
  },

  markKeyUsed: async ({ id, ip }: { id: string; ip?: string }): Promise<void> => {
    await apiKeysRepo.updateUsage({
      id: id,
      updates: {
        lastUsedAt: new Date(),
        lastUsedIp: ip ?? null,
      },
    });
    await apiKeysRepo.updateLimits(id);
  },
  updateExpiration: async ({ id }: { id: string }): Promise<void> => {
    await apiKeysRepo.updateExpiration({
      id: id,
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
    });
  },
  // updateLimits: async (id : string) => {
  //   await apiKeysRepo.updateLimits(id);
  // },
});
