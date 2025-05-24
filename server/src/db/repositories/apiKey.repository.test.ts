import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyMigration, db, resetDb } from '../../../test/db';
import { apiKeysTable } from '../schema';
import { createApiKeysRepo } from './apiKey.repository';

const repo = createApiKeysRepo(db);

describe('apiKeysRepo', () => {
  beforeEach(async () => {
    await applyMigration();
  });
  afterEach(async () => {
    await resetDb();
  });

  it('should create a new API key record and return it', async () => {
    const [result] = await repo.create({
      name: 'CLI Token',
      keyPrefix: 'prefix123456',
      hashedKey: 'hashed-key',
      description: 'test key',
    });
    expect(result).toMatchObject({
      name: 'CLI Token',
      keyPrefix: 'prefix123456',
      hashedKey: 'hashed-key',
      description: 'test key',
      active: true,
      expiresAt: expect.any(Date),
    });

    expect(result.id).toBeDefined();
  });

  it('should find a record by prefix and return only active keys', async () => {
    await db.insert(apiKeysTable).values([
      {
        name: 'Active Key',
        keyPrefix: 'prefix123456',
        hashedKey: 'hash1',
        active: true,
        description: 'active key',
      },
      {
        name: 'Inactive Key',
        keyPrefix: 'prefix789123',
        hashedKey: 'hash2',
        active: false,
        description: 'inactive key',
      },
    ]);

    const result = await repo.findByPrefix('prefix123456');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Active Key');
    expect(result[0].active).toBe(true);
    const resultInactive = await repo.findByPrefix('prefix789123');
    expect(resultInactive).toHaveLength(0);
    expect(resultInactive).toEqual([]);
  });

  it('should update usage info and return the updated record', async () => {
    const [created] = await repo.create({
      name: 'KeyToUpdate',
      keyPrefix: 'prefix999999',
      hashedKey: 'hash3',
    });

    const updateTime = new Date('2025-01-01T00:00:00Z');
    const [updated] = await repo.updateUsage({
      id: created.id,
      updates: {
        lastUsedAt: updateTime,
        lastUsedIp: '127.0.0.1',
      },
    });

    expect(updated.id).toBe(created.id);
    expect(updated.lastUsedAt?.toISOString()).toBe(updateTime.toISOString());
    expect(updated.lastUsedIp).toBe('127.0.0.1');
  });

  it('should return an empty array if no keys found', async () => {
    const result = await repo.findByPrefix('nonexistent');
    expect(result).toEqual([]);
  });
  it('should return an empty array if findByPrefix gets invalid data', async () => {
    const customRepo = createApiKeysRepo({
      query: {
        apiKeysTable: {
          findMany: () => [],
        },
      },
    });

    const result = await customRepo.findByPrefix('prefix');
    expect(result).toEqual([]);
  });
  it('should update expiration and return the updated record', async () => {
    const [created] = await repo.create({
      name: 'KeyToUpdate',
      keyPrefix: 'prefix999999',
      hashedKey: 'hash3',
    });

    const updateTime = new Date('2025-01-01T00:00:00Z');
    const [updated] = await repo.updateExpiration({
      id: created.id,
      expiresAt: updateTime,
    });

    expect(updated.id).toBe(created.id);
    expect(updated.expiresAt?.toISOString()).toBe(updateTime.toISOString());
  });
  it('should invalidate a key and return the updated record', async () => {
    const [created] = await repo.create({
      name: 'KeyToInvalidate',
      keyPrefix: 'prefix111111',
      hashedKey: 'hash4',
    });

    const [invalidated] = await repo.invalidateKey(created.id);
    expect(invalidated.id).toBe(created.id);
    expect(invalidated.active).toBe(false);
  });
});
