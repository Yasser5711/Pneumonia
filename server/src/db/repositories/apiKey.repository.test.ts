import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { applyMigration, db, resetDb } from '../../../test/db';
import { apiKeysTable, usersTable } from '../schema';

import { createApiKeysRepo } from './apiKey.repository';

const repo = createApiKeysRepo(db);
let user: typeof usersTable.$inferSelect;

describe('apiKeysRepo', () => {
  beforeEach(async () => {
    await applyMigration();
    [user] = await db
      .insert(usersTable)
      .values({
        email: 'test@example.com',
        provider: 'guest',
        providerId: 'test@example.com',
      })
      .returning();
  });

  afterEach(resetDb);

  describe('create', () => {
    it('persists and returns the new key (with default 10-day expiry)', async () => {
      const now = Date.now();

      const created = await repo.create({
        name: 'CLI Token',
        keyPrefix: 'prefix123456',
        hashedKey: 'hashed-key',
        description: 'test key',
        userId: user.id,
      });

      expect(created).toMatchObject({
        name: 'CLI Token',
        userId: user.id,
        keyPrefix: 'prefix123456',
        hashedKey: 'hashed-key',
        description: 'test key',
        active: true,
      });
      expect(created.id).toBeDefined();
      expect(created.expiresAt!.getTime()).toBeGreaterThanOrEqual(now + 9.9 * 24 * 60 * 60 * 1_000);
    });
  });

  describe('findByPrefix', () => {
    it('returns only active keys for the given prefix', async () => {
      await db.insert(apiKeysTable).values([
        {
          name: 'Active Key',
          keyPrefix: 'prefix123456',
          hashedKey: 'hash1',
          active: true,
          description: 'active key',
          userId: user.id,
        },
        {
          name: 'Inactive Key',
          keyPrefix: 'prefix789000',
          hashedKey: 'hash2',
          active: false,
          description: 'inactive key',
          userId: user.id,
        },
      ]);

      const keys = await repo.findByPrefix('prefix123456');
      expect(keys).toHaveLength(1);
      expect(keys[0].active).toBe(true);
    });

    it('returns [] when DB returns undefined or empty array', async () => {
      const stubUndefined = createApiKeysRepo({
        query: { apiKeysTable: { findMany: () => undefined } },
      });
      const stubEmpty = createApiKeysRepo({
        query: { apiKeysTable: { findMany: () => [] } },
      });

      expect(await stubUndefined.findByPrefix('p')).toEqual([]);
      expect(await stubEmpty.findByPrefix('p')).toEqual([]);
    });
  });

  describe('updateUsage', () => {
    it('updates lastUsed fields and returns the new row', async () => {
      const key = await repo.create({
        name: 'ToUpdate',
        keyPrefix: 'pref',
        hashedKey: 'hash',
        userId: user.id,
      });

      const stamp = new Date('2025-01-01T00:00:00Z');
      const [updated] = await repo.updateUsage({
        id: key.id,
        updates: { lastUsedAt: stamp, lastUsedIp: '127.0.0.1' },
      });

      expect(updated.lastUsedAt?.toISOString()).toBe(stamp.toISOString());
      expect(updated.lastUsedIp).toBe('127.0.0.1');
    });
  });

  describe('updateLimits', () => {
    it('increments freeRequestsUsed by 1', async () => {
      const key = await repo.create({
        name: 'Limiter',
        keyPrefix: 'pref',
        hashedKey: 'hash',
        userId: user.id,
      });

      const [updated] = await repo.updateLimits(key.id);
      expect(updated.freeRequestsUsed).toBe(1);
    });
  });

  describe('updateExpiration', () => {
    it('sets a new expiresAt and refreshes updatedAt', async () => {
      const key = await repo.create({
        name: 'ExpireMe',
        keyPrefix: 'pref',
        hashedKey: 'hash',
        userId: user.id,
      });

      const stamp = new Date('2025-01-01T00:00:00Z');
      const [updated] = await repo.updateExpiration({ id: key.id, expiresAt: stamp });

      expect(updated.expiresAt?.toISOString()).toBe(stamp.toISOString());
      expect(updated.updatedAt.getTime()).toBeGreaterThan(key.updatedAt.getTime());
    });
  });

  describe('invalidateKey', () => {
    it('sets active = false', async () => {
      const key = await repo.create({
        name: 'Invalidate',
        keyPrefix: 'pref',
        hashedKey: 'hash',
        userId: user.id,
      });

      const [invalidated] = await repo.invalidateKey(key.id);
      expect(invalidated.active).toBe(false);
    });
  });

  describe('resetQuota', () => {
    it('zeros freeRequestsUsed and stamps freeQuotaResetAt', async () => {
      const key = await repo.create({
        name: 'QuotaReset',
        keyPrefix: 'pref',
        hashedKey: 'hash',
        freeRequestsUsed: 5,
        userId: user.id,
      });

      const before = Date.now();
      const [reset] = await repo.resetQuota({ id: key.id });

      expect(reset.freeRequestsUsed).toBe(0);
      expect(reset.freeQuotaResetAt.getTime()).toBeGreaterThanOrEqual(before);
    });
  });

  describe('findByUserId', () => {
    it('returns only active keys for the user', async () => {
      const inactive = await repo.create({
        name: 'InactiveKey',
        keyPrefix: 'prefI',
        hashedKey: 'hashI',
        userId: user.id,
      });
      const active = await repo.create({
        name: 'ActiveKey',
        keyPrefix: 'prefA',
        hashedKey: 'hashA',
        userId: user.id,
      });
      await repo.invalidateKey(inactive.id);

      const keys = await repo.findByUserId(user.id);
      expect(keys).toHaveLength(1);
      expect(keys[0].id).toBe(active.id);
    });

    it('returns [] when DB returns undefined', async () => {
      const stub = createApiKeysRepo({
        query: { apiKeysTable: { findMany: () => undefined } },
      });
      expect(await stub.findByUserId('user-id')).toEqual([]);
    });
  });
});
