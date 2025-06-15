import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockApiKeyRepo } from '../../../test/repositories';
import * as apiKeyErrors from '../../errors/apiKey.errors';
import { createApiKeyService } from './apiKey.service';
const service = createApiKeyService(mockApiKeyRepo);

vi.mock('../../utils/hash', () => {
  return {
    hashApiKey: vi.fn((key) => `hashed-${key}`),
    compareApiKey: vi.fn((key, hash) => hash === `hashed-${key}`),
  };
});

describe('apiKeyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateKey', () => {
    it('should generate and return a valid API key and metadata', async () => {
      mockApiKeyRepo.create.mockResolvedValue([
        {
          id: 'mock-id',
          name: 'CLI Tool',
          hashedKey: 'hashed-secret',
          keyPrefix: 'mockprefix',
          active: true,
          freeRequestsUsed: 0,
          freeRequestsQuota: 10,
          expiresAt: null,
          description: 'For CLI',
          lastUsedAt: null,
          lastUsedIp: null,
        },
      ]);

      const result = await service.generateKey({ name: 'CLI Tool', description: 'For CLI' });

      expect(result.key).toHaveLength(64); // 32 bytes hex = 64 characters
      expect(result.meta.name).toBe('CLI Tool');
      expect(mockApiKeyRepo.create).toHaveBeenCalledExactlyOnceWith({
        name: 'CLI Tool',
        description: 'For CLI',
        keyPrefix: expect.stringMatching(/^[a-f0-9]{12}$/),
        hashedKey: expect.stringMatching(/^hashed-.+/),
      });
    });

    it('should throw error if creation fails', async () => {
      mockApiKeyRepo.create.mockResolvedValue([]);

      await expect(service.generateKey({ name: 'Fail', description: '' })).rejects.toThrow(
        'API key generation failed',
      );
    });
  });

  describe('validateKey', () => {
    const prefix = 'prefix123456';
    const secret = 'secretPart';
    const rawKey = `${prefix}${secret}`;

    const minimalCandidate = {
      id: 'candidate-id',
      name: 'test',
      keyPrefix: prefix,
      hashedKey: 'hashed-secretPart',
      active: true,
      freeRequestsUsed: 0,
      freeRequestsQuota: 10,
      expiresAt: null,
      description: 'desc',
      lastUsedAt: null,
      lastUsedIp: null,
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockApiKeyRepo.findByPrefix.mockReset();
      mockApiKeyRepo.invalidateKey.mockReset();
    });

    it('throws ApiKeyNotFoundError if no candidates found', async () => {
      mockApiKeyRepo.findByPrefix.mockResolvedValue([]);
      await expect(service.validateKey(rawKey)).rejects.toBeInstanceOf(
        apiKeyErrors.ApiKeyNotFoundError,
      );
      expect(mockApiKeyRepo.findByPrefix).toHaveBeenCalledWith(prefix);
    });

    it('returns the candidate when secret matches and all checks pass', async () => {
      mockApiKeyRepo.findByPrefix.mockResolvedValue([minimalCandidate]);

      const result = await service.validateKey(rawKey);
      expect(result).toEqual(minimalCandidate);
    });

    it('throws ApiKeyInactiveError if the candidate is inactive', async () => {
      const candidate = { ...minimalCandidate, active: false };
      mockApiKeyRepo.findByPrefix.mockResolvedValue([candidate]);

      await expect(service.validateKey(rawKey)).rejects.toBeInstanceOf(
        apiKeyErrors.ApiKeyInactiveError,
      );
    });

    it('throws ApiKeyExpiredError if the candidate has expired', async () => {
      const expiresAt = new Date(Date.now() - 1000);
      const candidate = { ...minimalCandidate, expiresAt };
      mockApiKeyRepo.findByPrefix.mockResolvedValue([candidate]);

      await expect(service.validateKey(rawKey)).rejects.toBeInstanceOf(
        apiKeyErrors.ApiKeyExpiredError,
      );
      expect(mockApiKeyRepo.invalidateKey).toHaveBeenCalledWith(candidate.id);
    });

    it('throws QuotaExceededError if freeRequestsUsed ≥ freeRequestsQuota', async () => {
      const candidate = { ...minimalCandidate, freeRequestsUsed: 10, freeRequestsQuota: 10 };
      mockApiKeyRepo.findByPrefix.mockResolvedValue([candidate]);

      await expect(service.validateKey(rawKey)).rejects.toBeInstanceOf(
        apiKeyErrors.QuotaExceededError,
      );
    });
  });

  describe('markKeyUsed', () => {
    it('should call updateUsage with timestamp and ip and update quota', async () => {
      const now = new Date();
      vi.setSystemTime(now);

      await service.markKeyUsed({ id: 'key-id', ip: '1.2.3.4' });

      expect(mockApiKeyRepo.updateUsage).toHaveBeenCalledWith({
        id: 'key-id',
        updates: {
          lastUsedAt: now,
          lastUsedIp: '1.2.3.4',
        },
      });
      expect(mockApiKeyRepo.updateLimits).toHaveBeenCalledWith('key-id');
    });
  });
  describe('updateExpiration', () => {
    it('should call updateExpiration with id and new expiration date', async () => {
      const now = new Date();
      vi.setSystemTime(now);

      await service.updateExpiration({ id: 'key-id' });

      expect(mockApiKeyRepo.updateExpiration).toHaveBeenCalledWith({
        id: 'key-id',
        expiresAt: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      });
    });
  });
});
