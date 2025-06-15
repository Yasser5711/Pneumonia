import { eq, type InferInsertModel, sql } from 'drizzle-orm';
// import type { PgliteDatabase } from 'drizzle-orm/pglite';
// import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { db as DB } from '../index';
// import type * as schema from '../schema';
import { apiKeysTable } from '../schema';

// type DrizzlePgDatabase = PostgresJsDatabase<typeof schema> | PgliteDatabase<typeof schema>;
type ApiKeyInsert = InferInsertModel<typeof apiKeysTable>;
export const createApiKeysRepo = (db: any = DB) => ({
  create: async (
    data: Pick<ApiKeyInsert, 'name' | 'hashedKey' | 'keyPrefix'> &
      Partial<Omit<ApiKeyInsert, 'name' | 'hashedKey' | 'keyPrefix'>>,
  ) => {
    const finalData = {
      ...data,
      expiresAt: data.expiresAt ?? new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    };
    return await db.insert(apiKeysTable).values(finalData).returning({
      id: apiKeysTable.id,
      name: apiKeysTable.name,
      hashedKey: apiKeysTable.hashedKey,
      keyPrefix: apiKeysTable.keyPrefix,
      expiresAt: apiKeysTable.expiresAt,
      updatedAt: apiKeysTable.updatedAt,
      active: apiKeysTable.active,
      freeRequestsUsed: apiKeysTable.freeRequestsUsed,
      freeRequestsQuota: apiKeysTable.freeRequestsQuota,
      description: apiKeysTable.description,
      lastUsedAt: apiKeysTable.lastUsedAt,
      lastUsedIp: apiKeysTable.lastUsedIp,
    });
  },

  findByPrefix: async (prefix: string) => {
    const rows = await db.query.apiKeysTable.findMany({
      where: eq(apiKeysTable.keyPrefix, prefix),
    });

    if (!rows || !Array.isArray(rows)) {
      return [];
    }

    const filteredRows = rows.filter((res) => res.active);
    return filteredRows.map((res) => ({
      id: res.id,
      name: res.name,
      hashedKey: res.hashedKey,
      keyPrefix: res.keyPrefix,
      expiresAt: res.expiresAt,
      updatedAt: res.updatedAt,
      active: res.active,
      freeRequestsUsed: res.freeRequestsUsed,
      freeRequestsQuota: res.freeRequestsQuota,
      description: res.description,
      lastUsedAt: res.lastUsedAt,
      lastUsedIp: res.lastUsedIp,
    }));
  },

  updateUsage: async ({ id, updates }: { id: string; updates: Partial<ApiKeyInsert> }) => {
    return await db.update(apiKeysTable).set(updates).where(eq(apiKeysTable.id, id)).returning({
      id: apiKeysTable.id,
      name: apiKeysTable.name,
      hashedKey: apiKeysTable.hashedKey,
      expiresAt: apiKeysTable.expiresAt,
      updatedAt: apiKeysTable.updatedAt,
      active: apiKeysTable.active,
      freeRequestsUsed: apiKeysTable.freeRequestsUsed,
      freeRequestsQuota: apiKeysTable.freeRequestsQuota,
      description: apiKeysTable.description,
      lastUsedAt: apiKeysTable.lastUsedAt,
      lastUsedIp: apiKeysTable.lastUsedIp,
    });
  },
  updateLimits: async (id: string) => {
    return await db
      .update(apiKeysTable)
      .set({
        freeRequestsUsed: sql`${apiKeysTable.freeRequestsUsed} + 1`,
      })
      .where(eq(apiKeysTable.id, id))
      .returning({
        id: apiKeysTable.id,
        name: apiKeysTable.name,
        hashedKey: apiKeysTable.hashedKey,
        expiresAt: apiKeysTable.expiresAt,
        updatedAt: apiKeysTable.updatedAt,
        active: apiKeysTable.active,
        freeRequestsUsed: apiKeysTable.freeRequestsUsed,
        freeRequestsQuota: apiKeysTable.freeRequestsQuota,
        description: apiKeysTable.description,
        lastUsedAt: apiKeysTable.lastUsedAt,
        lastUsedIp: apiKeysTable.lastUsedIp,
      });
  },
  resetQuota: async ({ id }: { id: string }) => {
    return await db
      .update(apiKeysTable)
      .set({
        freeRequestsUsed: 0,
        freeQuotaResetAt: new Date(),
      })
      .where(eq(apiKeysTable.id, id))
      .returning({
        id: apiKeysTable.id,
        name: apiKeysTable.name,
        hashedKey: apiKeysTable.hashedKey,
        expiresAt: apiKeysTable.expiresAt,
        updatedAt: apiKeysTable.updatedAt,
        active: apiKeysTable.active,
        freeRequestsUsed: apiKeysTable.freeRequestsUsed,
        freeRequestsQuota: apiKeysTable.freeRequestsQuota,
        description: apiKeysTable.description,
        lastUsedAt: apiKeysTable.lastUsedAt,
        lastUsedIp: apiKeysTable.lastUsedIp,
      });
  },
  updateExpiration: async ({ id, expiresAt }: { id: string; expiresAt: Date }) => {
    return await db
      .update(apiKeysTable)
      .set({ expiresAt })
      .where(eq(apiKeysTable.id, id))
      .returning({
        id: apiKeysTable.id,
        name: apiKeysTable.name,
        hashedKey: apiKeysTable.hashedKey,
        expiresAt: apiKeysTable.expiresAt,
        updatedAt: apiKeysTable.updatedAt,
        active: apiKeysTable.active,
        freeRequestsUsed: apiKeysTable.freeRequestsUsed,
        freeRequestsQuota: apiKeysTable.freeRequestsQuota,
        description: apiKeysTable.description,
        lastUsedAt: apiKeysTable.lastUsedAt,
        lastUsedIp: apiKeysTable.lastUsedIp,
      });
  },
  invalidateKey: async (id: string) => {
    return await db
      .update(apiKeysTable)
      .set({ active: false })
      .where(eq(apiKeysTable.id, id))
      .returning({
        id: apiKeysTable.id,
        name: apiKeysTable.name,
        hashedKey: apiKeysTable.hashedKey,
        expiresAt: apiKeysTable.expiresAt,
        updatedAt: apiKeysTable.updatedAt,
        active: apiKeysTable.active,
        freeRequestsQuota: apiKeysTable.freeRequestsQuota,
        freeRequestsUsed: apiKeysTable.freeRequestsUsed,
        description: apiKeysTable.description,
        lastUsedAt: apiKeysTable.lastUsedAt,
        lastUsedIp: apiKeysTable.lastUsedIp,
      });
  },
});
