import { logger } from '../../logger';

import { randomBytes } from 'crypto';
import { compareApiKey, hashApiKey } from '../../utils/hash';
import type { Repositories } from '../repositories/index';
export const createApiKeyService = (apiKeysRepo: Repositories['apiKeysRepo']) => ({
  generateKey: async ({ name, description }: { name: string; description?: string }) => {
    const rawKey = randomBytes(32).toString('hex');
    const prefix = rawKey.slice(0, 12);
    const secretPart = rawKey.slice(12);
    const hashed = await hashApiKey(secretPart);
    const [record] = await apiKeysRepo.create({
      name,
      description,
      keyPrefix: prefix,
      hashedKey: hashed,
    });

    if (!record) {
      logger().error('API key insert failed', { name, description });
      throw new Error('API key generation failed');
    }

    return {
      key: rawKey,
      meta: record,
    };
  },
  validateKey: async (key: string) => {
    const prefix = key.slice(0, 12);
    const secretPart = key.slice(12);

    const candidates = await apiKeysRepo.findByPrefix(prefix);

    if (!candidates || !Array.isArray(candidates)) {
      return null;
    }
    for (const candidate of candidates) {
      const isMatch = await compareApiKey(secretPart, candidate.hashedKey);
      const isActive = candidate.active;
      const isNotExpired = !candidate.expiresAt || candidate.expiresAt > new Date();

      if (isMatch && isActive && isNotExpired) {
        return candidate;
      }
      if (isMatch && isActive) {
        await apiKeysRepo.invalidateKey(candidate.id);
      }
    }

    return null;
  },

  markKeyUsed: async ({ id, ip }: { id: string; ip?: string }) => {
    await apiKeysRepo.updateUsage({
      id: id,
      updates: {
        lastUsedAt: new Date(),
        lastUsedIp: ip ?? null,
      },
    });
  },
  updateExpiration: async ({ id }: { id: string }) => {
    await apiKeysRepo.updateExpiration({
      id: id,
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
    });
  },
});
