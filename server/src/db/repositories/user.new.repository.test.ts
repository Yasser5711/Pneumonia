import { randomUUID } from 'node:crypto';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { applyMigration, db, resetDb } from '../../../test/db';
import { users as usersTable, apiKeys as apiKeysTable } from '../schema/auth';

import { createNewUsersRepo } from './user.new.repository';

// Type assertion to handle the PGlite vs PostgresJs type mismatch in tests
const usersRepo = createNewUsersRepo(db as any);

let user1: typeof usersTable.$inferSelect;
let user2: typeof usersTable.$inferSelect;
let apiKey1: typeof apiKeysTable.$inferSelect;
let _apiKey2: typeof apiKeysTable.$inferSelect;

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
      requestsUsed: 0,
      image: 'https://example.com/jane.jpg',
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

  [_apiKey2] = await db
    .insert(apiKeysTable)
    .values({
      name: 'Test Key 2',
      key: 'test-key-2',
      userId: user1.id,
      enabled: false,
      createdAt: new Date(),
    })
    .returning();
});

afterEach(resetDb);

describe('findById', () => {
  it('returns the correct user by id', async () => {
    const found = await usersRepo.findById({ id: user1.id });

    expect(found).toMatchObject({
      id: user1.id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      emailVerified: true,
      requestsQuota: 10,
      requestsUsed: 5,
    });
    expect(found?.name).toBe('John Doe');
    expect(found?.createdAt).toBeInstanceOf(Date);
  });

  it('returns undefined for an unknown id', async () => {
    const found = await usersRepo.findById({ id: randomUUID() });
    expect(found).toBeUndefined();
  });

  it('returns user without API keys when includeApiKeys is false', async () => {
    const found = await usersRepo.findById({ id: user1.id, includeApiKeys: false });

    expect(found).toBeDefined();
    expect(found?.apiKeys).toBeUndefined();
  });

  it('returns user with enabled API keys when includeApiKeys is true', async () => {
    const found = await usersRepo.findById({ id: user1.id, includeApiKeys: true });

    expect(found).toBeDefined();
    expect(found?.apiKeys).toBeDefined();
    expect(found?.apiKeys).toHaveLength(1);
    expect(found?.apiKeys?.[0]).toMatchObject({
      id: apiKey1.id,
      name: 'Test Key 1',
      enabled: true,
    });
  });

  it('returns user with empty API keys array when user has no enabled keys', async () => {
    const found = await usersRepo.findById({ id: user2.id, includeApiKeys: true });

    expect(found).toBeDefined();
    expect(found?.apiKeys).toBeDefined();
    expect(found?.apiKeys).toHaveLength(0);
  });
});

describe('findByEmail', () => {
  it('returns the correct user by email', async () => {
    const found = await usersRepo.findByEmail('john.doe@example.com');

    expect(found).toMatchObject({
      id: user1.id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    });
  });

  it('returns undefined for an unknown email', async () => {
    const found = await usersRepo.findByEmail('unknown@example.com');
    expect(found).toBeUndefined();
  });

  it('is case sensitive for email search', async () => {
    const found = await usersRepo.findByEmail('JOHN.DOE@EXAMPLE.COM');
    expect(found).toBeUndefined();
  });
});

describe('update', () => {
  it('updates user details and returns the updated user', async () => {
    const updates = {
      firstName: 'Johnny',
      lastName: 'Updated',
      image: 'https://example.com/johnny.jpg',
    };

    const updated = await usersRepo.update({
      id: user1.id,
      updates,
    });

    expect(updated).toMatchObject({
      id: user1.id,
      firstName: 'Johnny',
      lastName: 'Updated',
      email: 'john.doe@example.com',
      image: 'https://example.com/johnny.jpg',
    });
    expect(updated?.name).toBe('Johnny Updated');
  });

  it('updates only provided fields', async () => {
    const updates = {
      firstName: 'Jonathan',
    };

    const updated = await usersRepo.update({
      id: user1.id,
      updates,
    });

    expect(updated).toMatchObject({
      id: user1.id,
      firstName: 'Jonathan',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    });
  });

  it('returns undefined for an unknown id', async () => {
    const updated = await usersRepo.update({
      id: randomUUID(),
      updates: { firstName: 'New Name' },
    });

    expect(updated).toBeUndefined();
  });

  it('can update quota values', async () => {
    const updates = {
      requestsQuota: 50,
    };

    const updated = await usersRepo.update({
      id: user1.id,
      updates,
    });

    expect(updated?.requestsQuota).toBe(50);
    expect(updated?.requestsUsed).toBe(5);
  });

  it('can clear image field', async () => {
    const updates = {
      image: null,
    };

    const updated = await usersRepo.update({
      id: user2.id,
      updates,
    });

    expect(updated?.image).toBeNull();
  });
});

describe('updateQuota', () => {
  it('increments requestsUsed by 1', async () => {
    const initialUsed = user1.requestsUsed;

    await usersRepo.updateQuota(user1.id);

    const updatedUser = await usersRepo.findById({ id: user1.id });
    expect(updatedUser?.requestsUsed).toBe(initialUsed + 1);
  });

  it('works with user who has zero requests used', async () => {
    const initialUsed = user2.requestsUsed;

    await usersRepo.updateQuota(user2.id);

    const updatedUser = await usersRepo.findById({ id: user2.id });
    expect(updatedUser?.requestsUsed).toBe(initialUsed + 1);
  });

  it('can be called multiple times to increment', async () => {
    const initialUsed = user1.requestsUsed;

    await usersRepo.updateQuota(user1.id);
    await usersRepo.updateQuota(user1.id);
    await usersRepo.updateQuota(user1.id);

    const updatedUser = await usersRepo.findById({ id: user1.id });
    expect(updatedUser?.requestsUsed).toBe(initialUsed + 3);
  });

  it('does not affect requestsQuota', async () => {
    const initialQuota = user1.requestsQuota;

    await usersRepo.updateQuota(user1.id);

    const updatedUser = await usersRepo.findById({ id: user1.id });
    expect(updatedUser?.requestsQuota).toBe(initialQuota);
  });

  it('handles non-existent user gracefully', async () => {
    await expect(usersRepo.updateQuota(randomUUID())).resolves.not.toThrow();
  });
});

describe('repository creation', () => {
  it('can be created with custom db instance', () => {
    const customRepo = createNewUsersRepo(db as any);
    expect(customRepo).toBeDefined();
    expect(typeof customRepo.findById).toBe('function');
    expect(typeof customRepo.findByEmail).toBe('function');
    expect(typeof customRepo.update).toBe('function');
    expect(typeof customRepo.updateQuota).toBe('function');
  });
});
