import { randomUUID } from 'node:crypto';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { applyMigration, db, resetDb } from '../../../test/db';
import { users as usersTable, apiKeys as apiKeysTable } from '../schema/auth';

import { createNewApiKeysRepo } from './apiKey.new.repository';

const mockCreateApiKey = vi.hoisted(() => vi.fn());
vi.mock('../../utils/auth', () => ({
  auth: {
    api: {
      createApiKey: mockCreateApiKey,
    },
  },
}));

const repo = createNewApiKeysRepo(db as any);

let user1: typeof usersTable.$inferSelect;
let user2: typeof usersTable.$inferSelect;
let apiKey1: typeof apiKeysTable.$inferSelect;
let apiKey2: typeof apiKeysTable.$inferSelect;
let apiKey3: typeof apiKeysTable.$inferSelect;

beforeEach(async () => {
  await applyMigration();

  [user1] = await db
    .insert(usersTable)
    .values({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      emailVerified: true,
      requestsQuota: 10,
      requestsUsed: 5,
    })
    .returning();

  [user2] = await db
    .insert(usersTable)
    .values({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      emailVerified: false,
      requestsQuota: 20,
      requestsUsed: 25,
    })
    .returning();

  [apiKey1] = await db
    .insert(apiKeysTable)
    .values({
      name: 'Test Key 1',
      key: 'test-key-1',
      userId: user1.id,
      enabled: true,
      createdAt: new Date(),
    })
    .returning();

  [apiKey2] = await db
    .insert(apiKeysTable)
    .values({
      name: 'Test Key 2',
      key: 'test-key-2',
      userId: user1.id,
      enabled: false,
      createdAt: new Date(),
    })
    .returning();

  [apiKey3] = await db
    .insert(apiKeysTable)
    .values({
      name: 'User 2 Key',
      key: 'test-key-3',
      userId: user2.id,
      enabled: true,
      createdAt: new Date(),
    })
    .returning();
});

afterEach(() => {
  resetDb();
  vi.clearAllMocks();
  mockCreateApiKey.mockReset();
});

describe('findByUserId', () => {
  it('returns only enabled API keys by default', async () => {
    const keys = await repo.findByUserId({ userId: user1.id });

    expect(keys).toHaveLength(1);
    expect(keys[0]).toMatchObject({
      id: apiKey1.id,
      name: 'Test Key 1',
      enabled: true,
      userId: user1.id,
    });
  });

  it('returns all API keys when includeDisabled is true', async () => {
    const keys = await repo.findByUserId({ userId: user1.id, includeDisabled: true });

    expect(keys).toHaveLength(2);
    expect(keys).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: apiKey1.id,
          name: 'Test Key 1',
          enabled: true,
        }),
        expect.objectContaining({
          id: apiKey2.id,
          name: 'Test Key 2',
          enabled: false,
        }),
      ]),
    );
  });

  it('returns empty array for user with no API keys', async () => {
    const [newUser] = await db
      .insert(usersTable)
      .values({
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        emailVerified: true,
      })
      .returning();

    const keys = await repo.findByUserId({ userId: newUser.id });
    expect(keys).toHaveLength(0);
  });

  it('returns empty array for non-existent user', async () => {
    const keys = await repo.findByUserId({ userId: randomUUID() });
    expect(keys).toHaveLength(0);
  });

  it('filters keys by user correctly', async () => {
    const keys = await repo.findByUserId({ userId: user2.id });

    expect(keys).toHaveLength(1);
    expect(keys[0]).toMatchObject({
      id: apiKey3.id,
      name: 'User 2 Key',
      userId: user2.id,
    });
  });
});

describe('disableMyKeys', () => {
  it('disables all API keys for a user', async () => {
    const updatedKeys = await repo.disableMyKeys(user1.id);

    expect(updatedKeys).toHaveLength(2);
    expect(updatedKeys).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: apiKey1.id,
          enabled: false,
        }),
        expect.objectContaining({
          id: apiKey2.id,
          enabled: false,
        }),
      ]),
    );
  });

  it('returns empty array when user has no API keys', async () => {
    const [newUser] = await db
      .insert(usersTable)
      .values({
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        emailVerified: true,
      })
      .returning();

    const updatedKeys = await repo.disableMyKeys(newUser.id);
    expect(updatedKeys).toHaveLength(0);
  });

  it('does not affect other users keys', async () => {
    await repo.disableMyKeys(user1.id);

    const user2Keys = await repo.findByUserId({ userId: user2.id });
    expect(user2Keys).toHaveLength(1);
    expect(user2Keys[0].enabled).toBe(true);
  });

  it('handles non-existent user gracefully', async () => {
    const updatedKeys = await repo.disableMyKeys(randomUUID());
    expect(updatedKeys).toHaveLength(0);
  });
});

describe('getQuota', () => {
  it('returns quota information for existing API key', async () => {
    const quota = await repo.getQuota(apiKey1.id);

    expect(quota).toMatchObject({
      keyId: apiKey1.id,
      userId: user1.id,
      requestsQuota: 10,
      requestsUsed: 5,
    });
  });

  it('returns undefined for non-existent API key', async () => {
    const quota = await repo.getQuota(randomUUID());
    expect(quota).toBeUndefined();
  });

  it('returns correct quota for different users', async () => {
    const quota = await repo.getQuota(apiKey3.id);

    expect(quota).toMatchObject({
      keyId: apiKey3.id,
      userId: user2.id,
      requestsQuota: 20,
      requestsUsed: 25,
    });
  });
});

describe('create', () => {
  beforeEach(() => {
    mockCreateApiKey.mockReset();
  });

  it('creates a new API key when user has not exceeded quota', async () => {
    const mockKey = 'new-api-key-123';
    const mockId = randomUUID();

    mockCreateApiKey.mockResolvedValue({
      key: mockKey,
      id: mockId,
    });

    const result = await repo.create({
      userId: user1.id,
      name: 'New Test Key',
      expiresIn: 60 * 60 * 24,
    });
    expect(result).toEqual({ key: mockKey });
    expect(mockCreateApiKey).toHaveBeenCalledWith({
      body: {
        userId: user1.id,
        name: 'New Test Key',
        expiresIn: 60 * 60 * 24,
        prefix: 'pneumonia_',
      },
    });
  });

  it('returns existing key when user has exceeded quota', async () => {
    const result = await repo.create({
      userId: user2.id,
      name: 'Should Not Create',
    });

    expect(result).toEqual({
      key: apiKey3.key,
      id: apiKey3.id,
    });

    expect(mockCreateApiKey).not.toHaveBeenCalled();
  });

  it('uses default expiration when not provided', async () => {
    const mockKey = 'default-expiry-key';
    const mockId = randomUUID();

    mockCreateApiKey.mockResolvedValue({
      key: mockKey,
      id: mockId,
    });

    await repo.create({
      userId: user1.id,
      name: 'Default Expiry Key',
    });

    expect(mockCreateApiKey).toHaveBeenCalledWith({
      body: {
        userId: user1.id,
        name: 'Default Expiry Key',
        expiresIn: 30 * 24 * 60 * 60,
        prefix: 'pneumonia_',
      },
    });
  });

  it('disables existing API keys when creating a new one', async () => {
    const mockKey = 'new-replacement-key';
    const mockId = randomUUID();

    mockCreateApiKey.mockResolvedValue({
      key: mockKey,
      id: mockId,
    });

    await db.insert(apiKeysTable).values({
      id: mockId,
      name: 'New Key',
      key: mockKey,
      userId: user1.id,
      enabled: true,
      createdAt: new Date(),
    });

    await repo.create({
      userId: user1.id,
      name: 'Replacement Key',
    });

    const allKeys = await repo.findByUserId({ userId: user1.id, includeDisabled: true });
    const oldKeys = allKeys.filter((key) => key.id !== mockId);

    expect(oldKeys.every((key) => !key.enabled)).toBe(true);
  });

  it('throws error when quota exceeded but no existing key found', async () => {
    const [userWithoutKeys] = await db
      .insert(usersTable)
      .values({
        firstName: 'No',
        lastName: 'Keys',
        email: 'nokeys@example.com',
        emailVerified: true,
        requestsQuota: 5,
        requestsUsed: 10,
      })
      .returning();

    await expect(
      repo.create({
        userId: userWithoutKeys.id,
        name: 'Should Fail',
      }),
    ).rejects.toThrow(
      `Quota exceeded but no existing API key found for user ${userWithoutKeys.id}`,
    );
  });

  it('handles non-existent user', async () => {
    const nonExistentUserId = randomUUID();

    const mockKey = 'new-key-for-ghost';
    const mockId = randomUUID();

    mockCreateApiKey.mockResolvedValue({
      key: mockKey,
      id: mockId,
    });

    const result = await repo.create({
      userId: nonExistentUserId,
      name: 'Ghost User Key',
    });

    expect(result).toEqual({ key: mockKey });
    expect(mockCreateApiKey).toHaveBeenCalled();
  });
});

describe('repository creation', () => {
  it('can be created with custom db instance', () => {
    const customRepo = createNewApiKeysRepo(db as any);
    expect(customRepo).toBeDefined();
    expect(typeof customRepo.findByUserId).toBe('function');
    expect(typeof customRepo.disableMyKeys).toBe('function');
    expect(typeof customRepo.getQuota).toBe('function');
    expect(typeof customRepo.create).toBe('function');
  });
});
