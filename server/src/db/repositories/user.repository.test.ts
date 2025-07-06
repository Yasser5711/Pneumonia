import { randomUUID } from 'node:crypto';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { applyMigration, db, resetDb } from '../../../test/db';
import { apiKeysTable, usersTable } from '../schema';

import { createApiKeysRepo } from './apiKey.repository';
import { createUsersRepo } from './user.repository';

const usersRepo = createUsersRepo(db);
const keysRepo = createApiKeysRepo(db);

let user1: typeof usersTable.$inferSelect;
let user2: typeof usersTable.$inferSelect;
let key1: typeof apiKeysTable.$inferSelect;

beforeEach(async () => {
  await applyMigration();

  [user1] = await db
    .insert(usersTable)
    .values({
      email: 'u1@example.com',
      provider: 'guest',
      providerId: 'u1@example.com',
    })
    .returning();

  [user2] = await db
    .insert(usersTable)
    .values({
      email: 'u2@example.com',
      provider: 'guest',
      providerId: 'u2@example.com',
    })
    .returning();

  key1 = await keysRepo.create({
    name: 'Initial key',
    keyPrefix: 'pref-user1',
    hashedKey: 'hash1',
    userId: user1.id,
    freeRequestsQuota: 5,
  });
});

afterEach(resetDb);

describe('create', () => {
  it('persists and returns the user', async () => {
    const [created] = await usersRepo.create({
      email: 'new@example.com',
      provider: 'guest',
      providerId: 'new@example.com',
    });

    expect(created).toMatchObject({
      email: 'new@example.com',
      provider: 'guest',
      providerId: 'new@example.com',
    });
    expect(created.id).toBeDefined();
  });
});

describe('findById', () => {
  it('returns the correct user', async () => {
    const found = await usersRepo.findById(user1.id);
    expect(found?.email).toBe('u1@example.com');
  });

  it('returns undefined for an unknown id', async () => {
    const found = await usersRepo.findById(randomUUID());
    expect(found).toBeUndefined();
  });
});

describe('findByProvider', () => {
  it('matches by provider / providerId', async () => {
    const found = await usersRepo.findByProvider({
      provider: 'guest',
      providerId: 'u1@example.com',
    });
    expect(found?.id).toBe(user1.id);
  });

  it('returns undefined when nothing matches', async () => {
    const found = await usersRepo.findByProvider({
      provider: 'github',
      providerId: '123456',
    });
    expect(found).toBeUndefined();
  });
});

describe('update', () => {
  it('updates the row and bumps updatedAt', async () => {
    const [updated] = await usersRepo.update({
      id: user1.id,
      updates: { email: 'updated@example.com' },
    });

    expect(updated.email).toBe('updated@example.com');
    expect(updated.updatedAt.getTime()).toBeGreaterThan(user1.updatedAt!.getTime());
  });
});

describe('getMyKeys', () => {
  it('returns only keys that belong to the user', async () => {
    const keys = await usersRepo.getMyKeys(user1.id);
    expect(keys).toHaveLength(1);
    expect(keys[0].id).toBe(key1.id);
  });

  it('returns [] when the user owns no keys', async () => {
    expect(await usersRepo.getMyKeys(user2.id)).toEqual([]);
  });
});

describe('getMyQuota', () => {
  it('returns { total, used } for the latest active key', async () => {
    expect(await usersRepo.getMyQuota(user1.id)).toEqual({ total: 5, used: 0 });
  });

  it('returns { 0, 0 } when the user has no key', async () => {
    expect(await usersRepo.getMyQuota(user2.id)).toEqual({ total: 0, used: 0 });
  });
});

describe('upgradeQuota', () => {
  it('adds the requested quota increment', async () => {
    const updated = await usersRepo.upgradeQuota({ id: key1.id, quota: 10 });
    expect(updated.freeRequestsQuota).toBe(15);
  });

  it('defaults to +10 when quota param is omitted', async () => {
    const [{ id: extraKeyId, freeRequestsQuota: base }] = await db
      .insert(apiKeysTable)
      .values({
        name: 'tmp',
        keyPrefix: 'pref-extra',
        hashedKey: 'hash',
        userId: user2.id,
        freeRequestsQuota: 1,
      })
      .returning();

    const updated = await usersRepo.upgradeQuota({ id: extraKeyId });
    expect(updated.freeRequestsQuota).toBe(base + 10);
  });
});
