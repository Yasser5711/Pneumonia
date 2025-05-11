import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockApiKeyRepo } from '../../../test/repositories';
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
    it('should return the matching candidate if valid', async () => {
      mockApiKeyRepo.findByPrefix.mockResolvedValue([
        {
          id: 'valid-id',
          hashedKey: 'hashed-secretPart',
          name: 'test',
          keyPrefix: 'prefix123',
          active: true,
          expiresAt: null,
          description: 'desc',
          lastUsedAt: null,
          lastUsedIp: null,
        },
      ]);

      const rawKey = 'prefix123456secretPart';

      const result = await service.validateKey(rawKey);
      expect(result).not.toBeNull();
      expect(result?.id).toBe('valid-id');
      expect(mockApiKeyRepo.findByPrefix).toHaveBeenCalledExactlyOnceWith('prefix123456');
    });

    it('should return null if no match', async () => {
      mockApiKeyRepo.findByPrefix.mockResolvedValue([
        {
          id: 'valid-id',
          hashedKey: 'different-hash',
          name: 'test',
          keyPrefix: 'prefix123',
          active: true,
          expiresAt: null,
          description: 'desc',
          lastUsedAt: null,
          lastUsedIp: null,
        },
      ]);

      const result = await service.validateKey('prefix123secretPart');
      expect(result).toBeNull();
    });

    it('should return null if expired or inactive', async () => {
      mockApiKeyRepo.findByPrefix.mockResolvedValue([
        {
          id: 'valid-id',
          hashedKey: 'hashed-secretPart',
          name: 'test',
          keyPrefix: 'prefix123',
          active: false,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
          description: 'desc',
          lastUsedAt: new Date(),
          lastUsedIp: null,
        },
      ]);

      const result = await service.validateKey('prefix123secretPart');
      expect(result).toBeNull();
    });
    it('should return null if findByPrefix returns invalid type', async () => {
      // @ts-expect-error - simulate bad return
      mockApiKeyRepo.findByPrefix.mockResolvedValue('invalid');

      const result = await service.validateKey('prefix123secretPart');
      expect(result).toBeNull();
    });
  });

  describe('markKeyUsed', () => {
    it('should call updateUsage with timestamp and ip', async () => {
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
    });
  });
});
