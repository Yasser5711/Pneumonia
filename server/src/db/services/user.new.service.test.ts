import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockNewUserRepo } from '../../../test/repositories';
import { mockNewApiKeyService } from '../../../test/services';
import { UserNotFoundError } from '../../errors';

import { createNewUserService } from './user.new.service';

const createMockApiKey = (overrides: Partial<any> = {}) => ({
  id: 'api-key-123',
  name: 'Test Key',
  createdAt: new Date(),
  updatedAt: null,
  userId: 'user-123',
  expiresAt: null,
  start: null,
  prefix: 'tk_test',
  key: 'tk_test_abc123',
  enabled: true,
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
  ...overrides,
});

const userService = createNewUserService(mockNewUserRepo, mockNewApiKeyService);

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe('findById', () => {
  it('delegates to repo.findById with correct parameters', async () => {
    const mockUser = {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      name: 'John Doe',
      createdAt: new Date(),
      updatedAt: null,
      lastLoginAt: null,
      lastLoginIp: null,
      image: null,
      emailVerified: true,
      requestsQuota: 10,
      requestsUsed: 5,
      apiKeys: [],
      normalizedEmail: 'john.doe@example.com',
    };

    mockNewUserRepo.findById.mockResolvedValue(mockUser);

    const result = await userService.findById({ id: 'user-123', includeApiKeys: false });

    expect(result).toEqual(mockUser);
    expect(mockNewUserRepo.findById).toHaveBeenCalledWith({
      id: 'user-123',
      includeApiKeys: false,
    });
  });

  it('passes includeApiKeys parameter correctly', async () => {
    const mockUserWithKeys = {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      name: 'John Doe',
      createdAt: new Date(),
      updatedAt: null,
      lastLoginAt: null,
      lastLoginIp: null,
      image: null,
      emailVerified: true,
      requestsQuota: 10,
      requestsUsed: 5,
      apiKeys: [createMockApiKey()],
      normalizedEmail: 'john.doe@example.com',
    };

    mockNewUserRepo.findById.mockResolvedValue(mockUserWithKeys);

    const result = await userService.findById({ id: 'user-123', includeApiKeys: true });

    expect(result).toEqual(mockUserWithKeys);
    expect(mockNewUserRepo.findById).toHaveBeenCalledWith({
      id: 'user-123',
      includeApiKeys: true,
    });
  });

  it('returns null when user not found', async () => {
    mockNewUserRepo.findById.mockResolvedValue(undefined);

    const result = await userService.findById({ id: 'non-existent' });

    expect(result).toBeUndefined();
    expect(mockNewUserRepo.findById).toHaveBeenCalledWith({
      id: 'non-existent',
      includeApiKeys: false,
    });
  });
});

describe('getMe', () => {
  it('returns user profile with existing API key', async () => {
    const mockUser = {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      name: 'John Doe',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      lastLoginAt: new Date('2024-01-03'),
      lastLoginIp: '192.168.1.1',
      image: 'https://example.com/avatar.jpg',
      emailVerified: true,
      requestsQuota: 15,
      requestsUsed: 8,
      apiKeys: [createMockApiKey({ key: 'pneumonia_existing123' })],
      normalizedEmail: 'john.doe@example.com',
    };

    mockNewUserRepo.findById.mockResolvedValue(mockUser);

    const result = await userService.getMe('user-123');

    expect(result).toEqual({
      user: {
        id: 'user-123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        lastLoginAt: new Date('2024-01-03'),
        lastLoginIp: '192.168.1.1',
        firstName: 'John',
        lastName: 'Doe',
        image: 'https://example.com/avatar.jpg',
        apiKey: 'pneumonia_existing123',
      },
      quota: {
        total: 15,
        used: 8,
      },
    });

    expect(mockNewUserRepo.findById).toHaveBeenCalledWith({
      id: 'user-123',
      includeApiKeys: true,
    });
    expect(mockNewApiKeyService.generateKey).not.toHaveBeenCalled();
  });

  it('generates new API key when user has no existing keys', async () => {
    const mockUser = {
      id: 'user-456',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      createdAt: new Date('2024-01-01'),
      updatedAt: null,
      lastLoginAt: null,
      lastLoginIp: null,
      image: null,
      emailVerified: true,
      requestsQuota: 10,
      requestsUsed: 0,
      apiKeys: [],
      normalizedEmail: 'jane.smith@example.com',
    };

    const mockGeneratedKey = {
      key: 'pneumonia_generated456',
    };

    mockNewUserRepo.findById.mockResolvedValue(mockUser);
    mockNewApiKeyService.generateKey.mockResolvedValue(mockGeneratedKey);

    const result = await userService.getMe('user-456');

    expect(result).toEqual({
      user: {
        id: 'user-456',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        createdAt: new Date('2024-01-01'),
        updatedAt: null,
        lastLoginAt: null,
        lastLoginIp: null,
        firstName: 'Jane',
        lastName: 'Smith',
        image: null,
        apiKey: 'pneumonia_generated456',
      },
      quota: {
        total: 10,
        used: 0,
      },
    });

    expect(mockNewApiKeyService.generateKey).toHaveBeenCalledWith({
      userId: 'user-456',
    });
  });

  it('generates new API key when user has undefined apiKeys', async () => {
    const mockUser = {
      id: 'user-789',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@example.com',
      name: 'Bob Johnson',
      createdAt: new Date('2024-01-01'),
      updatedAt: null,
      lastLoginAt: null,
      lastLoginIp: null,
      image: null,
      emailVerified: true,
      requestsQuota: 20,
      requestsUsed: 3,
      apiKeys: [],
      normalizedEmail: 'bob.johnson@example.com',
    };

    const mockGeneratedKey = {
      key: 'pneumonia_generated789',
    };

    mockNewUserRepo.findById.mockResolvedValue(mockUser);
    mockNewApiKeyService.generateKey.mockResolvedValue(mockGeneratedKey);

    const result = await userService.getMe('user-789');

    expect(result.user.apiKey).toBe('pneumonia_generated789');
    expect(mockNewApiKeyService.generateKey).toHaveBeenCalledWith({
      userId: 'user-789',
    });
  });

  it('throws error when user not found', async () => {
    mockNewUserRepo.findById.mockResolvedValue(undefined);

    await expect(userService.getMe('non-existent')).rejects.toThrow(UserNotFoundError);

    expect(mockNewUserRepo.findById).toHaveBeenCalledWith({
      id: 'non-existent',
      includeApiKeys: true,
    });
    expect(mockNewApiKeyService.generateKey).not.toHaveBeenCalled();
  });

  it('handles user with null image correctly', async () => {
    const mockUser = {
      id: 'user-null-image',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: null,
      lastLoginAt: null,
      lastLoginIp: null,
      image: null,
      emailVerified: true,
      requestsQuota: 5,
      requestsUsed: 2,
      apiKeys: [createMockApiKey({ key: 'pneumonia_nullimage' })],
      normalizedEmail: 'test@example.com',
    };

    mockNewUserRepo.findById.mockResolvedValue(mockUser);

    const result = await userService.getMe('user-null-image');

    expect(result.user.image).toBeNull();
    expect(result.user.apiKey).toBe('pneumonia_nullimage');
  });
});

describe('updateProfile', () => {
  it('delegates to repo.update with correct parameters', async () => {
    const mockUpdatedUser = {
      id: 'user-123',
      firstName: 'Updated',
      lastName: 'Name',
      email: 'updated@example.com',
      name: 'Updated Name',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      lastLoginIp: null,
      image: 'https://example.com/new-avatar.jpg',
      emailVerified: true,
      requestsQuota: 25,
      requestsUsed: 10,
      normalizedEmail: 'updated@example.com',
    };

    const updates = {
      firstName: 'Updated',
      lastName: 'Name',
      image: 'https://example.com/new-avatar.jpg',
      requestsQuota: 25,
    };

    mockNewUserRepo.update.mockResolvedValue(mockUpdatedUser);

    const result = await userService.updateProfile('user-123', updates);

    expect(result).toEqual(mockUpdatedUser);
    expect(mockNewUserRepo.update).toHaveBeenCalledWith({
      id: 'user-123',
      updates,
    });
  });

  it('handles partial updates correctly', async () => {
    const mockUpdatedUser = {
      id: 'user-456',
      firstName: 'PartialUpdate',
      lastName: 'Doe',
      email: 'partial@example.com',
      name: 'PartialUpdate Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      lastLoginIp: null,
      image: null,
      emailVerified: true,
      requestsQuota: 10,
      requestsUsed: 5,
      normalizedEmail: 'partial@example.com',
    };

    const updates = {
      firstName: 'PartialUpdate',
    };

    mockNewUserRepo.update.mockResolvedValue(mockUpdatedUser);

    const result = await userService.updateProfile('user-456', updates);

    expect(result).toEqual(mockUpdatedUser);
    expect(mockNewUserRepo.update).toHaveBeenCalledWith({
      id: 'user-456',
      updates: { firstName: 'PartialUpdate' },
    });
  });

  it('handles login tracking updates', async () => {
    const mockUpdatedUser = {
      id: 'user-login',
      firstName: 'Login',
      lastName: 'Tracker',
      email: 'login@example.com',
      name: 'Login Tracker',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      lastLoginIp: '10.0.0.1',
      image: null,
      emailVerified: true,
      requestsQuota: 10,
      requestsUsed: 5,
      normalizedEmail: 'login@example.com',
    };

    const updates = {
      lastLoginAt: new Date(),
      lastLoginIp: '10.0.0.1',
    };

    mockNewUserRepo.update.mockResolvedValue(mockUpdatedUser);

    const result = await userService.updateProfile('user-login', updates);

    expect(result).toEqual(mockUpdatedUser);
    expect(mockNewUserRepo.update).toHaveBeenCalledWith({
      id: 'user-login',
      updates,
    });
  });

  it('returns undefined when user not found', async () => {
    mockNewUserRepo.update.mockResolvedValue(undefined);

    const result = await userService.updateProfile('non-existent', {
      firstName: 'Should',
      lastName: 'Fail',
    });

    expect(result).toBeUndefined();
    expect(mockNewUserRepo.update).toHaveBeenCalledWith({
      id: 'non-existent',
      updates: { firstName: 'Should', lastName: 'Fail' },
    });
  });
});

describe('updateQuota', () => {
  it('delegates to repo.updateQuota', async () => {
    mockNewUserRepo.updateQuota.mockResolvedValue(undefined);

    await userService.updateQuota('user-123');

    expect(mockNewUserRepo.updateQuota).toHaveBeenCalledWith('user-123');
  });

  it('works with any user ID', async () => {
    mockNewUserRepo.updateQuota.mockResolvedValue(undefined);

    await userService.updateQuota('different-user-456');

    expect(mockNewUserRepo.updateQuota).toHaveBeenCalledWith('different-user-456');
  });
});

describe('service creation', () => {
  it('can be created with required dependencies', () => {
    const customService = createNewUserService(mockNewUserRepo, mockNewApiKeyService);
    expect(customService).toBeDefined();
    expect(typeof customService.findById).toBe('function');
    expect(typeof customService.getMe).toBe('function');
    expect(typeof customService.updateProfile).toBe('function');
    expect(typeof customService.updateQuota).toBe('function');
  });
});
