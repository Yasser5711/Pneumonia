import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { mockNewApiKeyRepo } from '../../../test/repositories';
import {
  ApiKeyGenerationFailedError,
  ApiKeyInvalidError,
  ApiKeyQuotaExceededError,
  ApiKeyQuotaNotSetError,
  NoApiKeyFoundForUserError,
} from '../../errors';

import { createNewApiKeyService } from './apiKey.new.service';

const mockVerifyApiKey = vi.hoisted(() => vi.fn());
vi.mock('../../utils/auth', () => ({
  auth: {
    api: {
      verifyApiKey: mockVerifyApiKey,
    },
  },
}));

const service = createNewApiKeyService(mockNewApiKeyRepo);

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('generateKey', () => {
  it('successfully generates a new API key', async () => {
    const mockResult = {
      key: 'pneumonia_abc123def456',
    };

    mockNewApiKeyRepo.create.mockResolvedValue(mockResult);

    const result = await service.generateKey({
      userId: 'user-123',
      name: 'Test Key',
      expiresIn: 60 * 60 * 24,
    });

    expect(result).toEqual(mockResult);
    expect(mockNewApiKeyRepo.create).toHaveBeenCalledWith({
      userId: 'user-123',
      name: 'Test Key',
      expiresIn: 60 * 60 * 24,
    });
  });

  it('uses default expiration when not provided', async () => {
    const mockResult = {
      key: 'pneumonia_default123',
    };

    mockNewApiKeyRepo.create.mockResolvedValue(mockResult);

    const result = await service.generateKey({
      userId: 'user-123',
      name: 'Default Expiry Key',
    });

    expect(result).toEqual(mockResult);
    expect(mockNewApiKeyRepo.create).toHaveBeenCalledWith({
      userId: 'user-123',
      name: 'Default Expiry Key',
      expiresIn: 30 * 24 * 60 * 60,
    });
  });

  it('generates key without name', async () => {
    const mockResult = {
      key: 'pneumonia_noname789',
    };

    mockNewApiKeyRepo.create.mockResolvedValue(mockResult);

    const result = await service.generateKey({
      userId: 'user-123',
    });

    expect(result).toEqual(mockResult);
    expect(mockNewApiKeyRepo.create).toHaveBeenCalledWith({
      userId: 'user-123',
      name: undefined,
      expiresIn: 30 * 24 * 60 * 60,
    });
  });

  it('throws error when repository create fails', async () => {
    const repositoryError = new Error('Database connection failed');
    mockNewApiKeyRepo.create.mockRejectedValue(repositoryError);

    await expect(
      service.generateKey({
        userId: 'user-123',
        name: 'Failing Key',
      }),
    ).rejects.toThrow(ApiKeyGenerationFailedError);

    expect(mockNewApiKeyRepo.create).toHaveBeenCalledWith({
      userId: 'user-123',
      name: 'Failing Key',
      expiresIn: 30 * 24 * 60 * 60,
    });
  });
});

describe('verifyKey', () => {
  it('successfully verifies a valid API key', async () => {
    const mockAuthResponse = {
      key: {
        id: 'key-123',
        userId: 'user-456',
      },
      valid: true,
    };

    const mockQuotaResponse = {
      keyId: 'key-123',
      requestsQuota: 10,
      requestsUsed: 5,
      userId: 'user-456',
    };

    mockVerifyApiKey.mockResolvedValue(mockAuthResponse);
    mockNewApiKeyRepo.getQuota.mockResolvedValue(mockQuotaResponse);

    const result = await service.verifyKey('pneumonia_test123');

    expect(result).toEqual({
      ...mockAuthResponse,
      userId: 'user-456',
    });
    expect(mockVerifyApiKey).toHaveBeenCalledWith({
      body: { key: 'pneumonia_test123' },
    });
    expect(mockNewApiKeyRepo.getQuota).toHaveBeenCalledWith('key-123');
  });

  it('throws error when auth verification fails', async () => {
    const authError = new Error('Auth service unavailable');
    mockVerifyApiKey.mockRejectedValue(authError);

    await expect(service.verifyKey('invalid-key')).rejects.toThrow(
      'Failed to verify API key: Auth service unavailable',
    );

    expect(mockVerifyApiKey).toHaveBeenCalledWith({
      body: { key: 'invalid-key' },
    });
    expect(mockNewApiKeyRepo.getQuota).not.toHaveBeenCalled();
  });

  it('throws error when API key is invalid (no response)', async () => {
    mockVerifyApiKey.mockResolvedValue(null);

    await expect(service.verifyKey('invalid-key')).rejects.toThrow(ApiKeyInvalidError);

    expect(mockVerifyApiKey).toHaveBeenCalledWith({
      body: { key: 'invalid-key' },
    });
    expect(mockNewApiKeyRepo.getQuota).not.toHaveBeenCalled();
  });

  it('throws error when API key is invalid (no key in response)', async () => {
    mockVerifyApiKey.mockResolvedValue({
      key: null,
      valid: true,
    });

    await expect(service.verifyKey('invalid-key')).rejects.toThrow(ApiKeyInvalidError);

    expect(mockNewApiKeyRepo.getQuota).not.toHaveBeenCalled();
  });

  it('throws error when API key is invalid (not valid)', async () => {
    mockVerifyApiKey.mockResolvedValue({
      key: { id: 'key-123' },
      valid: false,
    });

    await expect(service.verifyKey('invalid-key')).rejects.toThrow(ApiKeyInvalidError);

    expect(mockNewApiKeyRepo.getQuota).not.toHaveBeenCalled();
  });

  it('throws error when quota is not set', async () => {
    const mockAuthResponse = {
      key: {
        id: 'key-123',
        userId: 'user-456',
      },
      valid: true,
    };

    const mockQuotaResponse = {
      keyId: 'key-123',
      requestsQuota: null,
      requestsUsed: 5,
      userId: 'user-456',
    };

    mockVerifyApiKey.mockResolvedValue(mockAuthResponse);
    mockNewApiKeyRepo.getQuota.mockResolvedValue(mockQuotaResponse);

    await expect(service.verifyKey('pneumonia_test123')).rejects.toThrow(ApiKeyQuotaNotSetError);
  });

  it('throws error when quota is exceeded', async () => {
    const mockAuthResponse = {
      key: {
        id: 'key-123',
        userId: 'user-456',
      },
      valid: true,
    };

    const mockQuotaResponse = {
      keyId: 'key-123',
      requestsQuota: 10,
      requestsUsed: 15,
      userId: 'user-456',
    };

    mockVerifyApiKey.mockResolvedValue(mockAuthResponse);
    mockNewApiKeyRepo.getQuota.mockResolvedValue(mockQuotaResponse);

    await expect(service.verifyKey('pneumonia_test123')).rejects.toThrow(ApiKeyQuotaExceededError);
  });

  it('treats null requestsUsed as 0', async () => {
    const mockAuthResponse = {
      key: {
        id: 'key-123',
        userId: 'user-456',
      },
      valid: true,
    };

    const mockQuotaResponse = {
      keyId: 'key-123',
      requestsQuota: 10,
      requestsUsed: null,
      userId: 'user-456',
    };

    mockVerifyApiKey.mockResolvedValue(mockAuthResponse);
    mockNewApiKeyRepo.getQuota.mockResolvedValue(mockQuotaResponse);

    const result = await service.verifyKey('pneumonia_test123');

    expect(result).toEqual({
      ...mockAuthResponse,
      userId: 'user-456',
    });
  });

  it('treats undefined requestsUsed as 0', async () => {
    const mockAuthResponse = {
      key: {
        id: 'key-123',
        userId: 'user-456',
      },
      valid: true,
    };

    const mockQuotaResponse = {
      keyId: 'key-123',
      requestsQuota: 10,
      requestsUsed: null,
      userId: 'user-456',
    };

    mockVerifyApiKey.mockResolvedValue(mockAuthResponse);
    mockNewApiKeyRepo.getQuota.mockResolvedValue(mockQuotaResponse);

    const result = await service.verifyKey('pneumonia_test123');

    expect(result).toEqual({
      ...mockAuthResponse,
      userId: 'user-456',
    });
  });
});

describe('getMyKey', () => {
  it('returns the first API key for a user', async () => {
    const mockKeys = [
      {
        id: 'key-123',
        name: 'Main Key',
        userId: 'user-456',
        enabled: true,
        key: 'pneumonia_abc123',
        createdAt: new Date(),
        updatedAt: null,
        expiresAt: null,
        start: null,
        prefix: null,
        refillInterval: null,
        refillAmount: null,
        lastRefillAt: null,
        rateLimitEnabled: null,
        rateLimitTimeWindow: null,
        rateLimitMax: null,
        requestCount: null,
        remaining: null,
        lastRequest: null,
        permissions: null,
        metadata: null,
      },
      {
        id: 'key-456',
        name: 'Secondary Key',
        userId: 'user-456',
        enabled: false,
        key: 'pneumonia_def456',
        createdAt: new Date(),
        updatedAt: null,
        expiresAt: null,
        start: null,
        prefix: null,
        refillInterval: null,
        refillAmount: null,
        lastRefillAt: null,
        rateLimitEnabled: null,
        rateLimitTimeWindow: null,
        rateLimitMax: null,
        requestCount: null,
        remaining: null,
        lastRequest: null,
        permissions: null,
        metadata: null,
      },
    ];

    mockNewApiKeyRepo.findByUserId.mockResolvedValue(mockKeys);

    const result = await service.getMyKey('user-456');

    expect(result).toEqual(mockKeys[0]);
    expect(mockNewApiKeyRepo.findByUserId).toHaveBeenCalledWith({
      userId: 'user-456',
    });
  });

  it('throws error when user has no API keys', async () => {
    mockNewApiKeyRepo.findByUserId.mockResolvedValue([]);

    await expect(service.getMyKey('user-no-keys')).rejects.toThrow(
      'No API key found for this user',
    );

    expect(mockNewApiKeyRepo.findByUserId).toHaveBeenCalledWith({
      userId: 'user-no-keys',
    });
  });

  it('throws error when repository returns null', async () => {
    mockNewApiKeyRepo.findByUserId.mockResolvedValue([]);

    await expect(service.getMyKey('user-null')).rejects.toThrow(NoApiKeyFoundForUserError);

    expect(mockNewApiKeyRepo.findByUserId).toHaveBeenCalledWith({
      userId: 'user-null',
    });
  });
});

describe('service creation', () => {
  it('can be created with repository dependency', () => {
    const customService = createNewApiKeyService(mockNewApiKeyRepo);
    expect(customService).toBeDefined();
    expect(typeof customService.generateKey).toBe('function');
    expect(typeof customService.verifyKey).toBe('function');
    expect(typeof customService.getMyKey).toBe('function');
  });
});
