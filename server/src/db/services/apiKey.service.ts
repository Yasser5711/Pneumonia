import { logger } from '@logger';

import { compareApiKey, hashApiKey } from '@utils/hash';
import { randomBytes } from 'crypto';
export const createApiKeyService = (
  apiKeysRepo: ReturnType<typeof import('@repositories/apiKey.repository').createApiKeysRepo>,
) => ({
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
      const match = await compareApiKey(secretPart, candidate.hashedKey);
      if (match && candidate.active && (!candidate.expiresAt || candidate.expiresAt > new Date())) {
        return candidate;
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
});
