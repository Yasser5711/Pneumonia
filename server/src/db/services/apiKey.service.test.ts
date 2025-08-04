import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { mockApiKeyRepo } from '../../../test/repositories';
import * as apiKeyErrors from '../../errors';

import { createApiKeyService } from './apiKey.service';

// vi.mock('crypto');
// vi.mock('../../utils/hash');
vi.mock('../../utils/hash', () => {
  return {
    hashApiKey: vi.fn((key) => `hashed-${key}`),
    compareApiKey: vi.fn((key, hash) => hash === `hashed-${key}`),
  };
});

const service = createApiKeyService(mockApiKeyRepo);

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('generateKey', () => {
  it('creates a new key and returns { key, meta }', async () => {
    mockApiKeyRepo.findByUserId.mockResolvedValue([]);
    mockApiKeyRepo.create.mockResolvedValue({
      id: 'id1',
      userId: 'user1',
      name: 'user-user1-key',
      keyPrefix: 'aaaaaaaaaaaa',
      hashedKey: 'hashed',
      active: true,
      freeRequestsQuota: 10,
      freeRequestsUsed: 0,
      expiresAt: null,
      updatedAt: new Date(),
      description: undefined,
      lastUsedAt: null,
      lastUsedIp: null,
    });

    const { key, meta } = await service.generateKey({
      userId: 'user1',
    });
    expect(key).toHaveLength(64);
    expect(meta.id).toBe('id1');
    expect(mockApiKeyRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'user-user1-key',
        userId: 'user1',
      }),
    );
  });

  it('throws when repo.create returns []', async () => {
    (mockApiKeyRepo.findByUserId.mockResolvedValue([]),
      mockApiKeyRepo.create.mockResolvedValue(undefined),
      await expect(service.generateKey({ userId: 'u-err', name: 'x' })).rejects.toThrow(
        'API key generation failed',
      ));
  });
});

describe('validateKey', () => {
  const prefix = 'prefix123456';
  const secret = 'secretPart';
  const fullKey = `${prefix}${secret}`;

  beforeEach(() => {
    mockApiKeyRepo.findByPrefix.mockReset();
  });

  it('throws ApiKeyInvalidError for key shorter than 13 chars', async () => {
    await expect(service.validateKey('short')).rejects.toBeInstanceOf(
      apiKeyErrors.ApiKeyInvalidError,
    );
  });

  it('throws ApiKeyNotFoundError when no prefix match', async () => {
    mockApiKeyRepo.findByPrefix.mockResolvedValue([]);
    await expect(service.validateKey(fullKey)).rejects.toBeInstanceOf(
      apiKeyErrors.ApiKeyNotFoundError,
    );
  });

  it('throws ApiKeyInactiveError for inactive key', async () => {
    mockApiKeyRepo.findByPrefix.mockResolvedValue([
      {
        active: false,
        hashedKey: 'hashed-secretPart',
        expiresAt: null,
      } as any,
    ]);

    await expect(service.validateKey(fullKey)).rejects.toBeInstanceOf(
      apiKeyErrors.ApiKeyInactiveError,
    );
  });

  it('throws ApiKeyExpiredError and invalidates key when expired', async () => {
    const expired = {
      id: '1',
      active: true,
      expiresAt: new Date('2000-01-01'),
      hashedKey: 'hashed-secretPart',
    };
    mockApiKeyRepo.findByPrefix.mockResolvedValue([expired] as any);

    await expect(service.validateKey(fullKey)).rejects.toBeInstanceOf(
      apiKeyErrors.ApiKeyExpiredError,
    );
    expect(mockApiKeyRepo.invalidateKey).toHaveBeenCalledWith('1');
  });

  it('throws QuotaExceededError when freeRequestsUsed ≥ quota', async () => {
    mockApiKeyRepo.findByPrefix.mockResolvedValue([
      {
        hashedKey: 'hashed-secretPart',
        active: true,
        expiresAt: null,
        freeRequestsUsed: 10,
        freeRequestsQuota: 10,
      } as any,
    ]);

    await expect(service.validateKey(fullKey)).rejects.toBeInstanceOf(
      apiKeyErrors.QuotaExceededError,
    );
  });
  it('throws ApiKeyInvalidError when no candidate matches the hash', async () => {
    const badPrefix = 'badbadbadbad';
    const fullKey = badPrefix + 'secret';
    mockApiKeyRepo.findByPrefix.mockResolvedValue([
      {
        hashedKey: 'some-other-hash',
        active: true,
        expiresAt: null,
        freeRequestsUsed: 0,
        freeRequestsQuota: 10,
      },
    ] as any);

    await expect(service.validateKey(fullKey)).rejects.toBeInstanceOf(
      apiKeyErrors.ApiKeyInvalidError,
    );
  });
  it('returns the candidate when everything is valid', async () => {
    const candidate = {
      id: 'id',
      hashedKey: 'hashed-secretPart',
      active: true,
      expiresAt: null,
      freeRequestsUsed: 0,
      freeRequestsQuota: 10,
    };
    mockApiKeyRepo.findByPrefix.mockResolvedValue([candidate] as any);

    const result = await service.validateKey(fullKey);
    expect(result).toBe(candidate);
  });
});

describe('markKeyUsed', () => {
  it('updates usage and increments counter', async () => {
    await service.markKeyUsed({ id: 'id123', ip: '1.1.1.1' });
    expect(mockApiKeyRepo.updateUsage).toHaveBeenCalled();
    expect(mockApiKeyRepo.updateLimits).toHaveBeenCalledWith('id123');
  });
});

describe('updateExpiration', () => {
  it('sets expiresAt to ~10 days in the future', async () => {
    const before = Date.now();
    await service.updateExpiration({ id: 'id123' });

    const [args] = mockApiKeyRepo.updateExpiration.mock.calls[0];
    const delta = (args.expiresAt as Date).getTime() - before;

    expect(delta).toBeGreaterThan(9.9 * 24 * 60 * 60 * 1000);
    expect(delta).toBeLessThan(10.1 * 24 * 60 * 60 * 1000);
  });
});
