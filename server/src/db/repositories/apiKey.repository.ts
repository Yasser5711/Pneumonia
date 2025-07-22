import { and, eq, type InferInsertModel, sql } from 'drizzle-orm';

// import type { PgliteDatabase } from 'drizzle-orm/pglite';
// import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { db as DB } from '../index';
// import type * as schema from '../schema';
import { apiKeysTable } from '../schema';

// type DrizzlePgDatabase = PostgresJsDatabase<typeof schema> | PgliteDatabase<typeof schema>;
type ApiKeyInsert = InferInsertModel<typeof apiKeysTable>;
/**
 * @deprecated
 */
export const createApiKeysRepo = (db: any = DB) => ({
  create: async (
    data: Pick<ApiKeyInsert, 'userId' | 'name' | 'hashedKey' | 'keyPrefix'> &
      Partial<Omit<ApiKeyInsert, 'userId' | 'name' | 'hashedKey' | 'keyPrefix'>>,
  ) => {
    return await db.transaction(async (tx: any) => {
      const [lastActive] = await tx.query.apiKeysTable.findMany({
        where: and(eq(apiKeysTable.userId, data.userId), eq(apiKeysTable.active, true)),
        orderBy: apiKeysTable.createdAt,
        limit: 1,
      });
      if (lastActive) {
        await tx
          .update(apiKeysTable)
          .set({ active: false })
          .where(and(eq(apiKeysTable.userId, data.userId), eq(apiKeysTable.active, true)));
      }

      const now = new Date();
      const finalData: ApiKeyInsert = {
        ...data,
        freeRequestsQuota: data.freeRequestsQuota,
        freeRequestsUsed: lastActive?.freeRequestsUsed ?? 0,
        expiresAt: data.expiresAt ?? new Date(now.getTime() + 10 * 24 * 3600_000),
      };

      const [inserted] = await tx.insert(apiKeysTable).values(finalData).returning({
        id: apiKeysTable.id,
        name: apiKeysTable.name,
        userId: apiKeysTable.userId,
        hashedKey: apiKeysTable.hashedKey,
        keyPrefix: apiKeysTable.keyPrefix,
        expiresAt: apiKeysTable.expiresAt,
        active: apiKeysTable.active,
        freeRequestsUsed: apiKeysTable.freeRequestsUsed,
        freeRequestsQuota: apiKeysTable.freeRequestsQuota,
        description: apiKeysTable.description,
        createdAt: apiKeysTable.createdAt,
        lastUsedAt: apiKeysTable.lastUsedAt,
        lastUsedIp: apiKeysTable.lastUsedIp,
        updatedAt: apiKeysTable.updatedAt,
      });

      return inserted;
    });
  },

  findByPrefix: async (prefix: string) => {
    const rows = await db.query.apiKeysTable.findMany({
      where: eq(apiKeysTable.keyPrefix, prefix),
      with: {
        user: true,
      },
    });

    if (!rows || !Array.isArray(rows)) {
      return [];
    }

    const filteredRows = rows.filter((res) => res.active);
    return filteredRows.map((res) => ({
      id: res.id,
      name: res.name,
      userId: res.userId,
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
      userId: apiKeysTable.userId,
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
        userId: apiKeysTable.userId,
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
        userId: apiKeysTable.userId,
        hashedKey: apiKeysTable.hashedKey,
        expiresAt: apiKeysTable.expiresAt,
        updatedAt: apiKeysTable.updatedAt,
        active: apiKeysTable.active,
        freeRequestsUsed: apiKeysTable.freeRequestsUsed,
        freeRequestsQuota: apiKeysTable.freeRequestsQuota,
        freeQuotaResetAt: apiKeysTable.freeQuotaResetAt,
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
        userId: apiKeysTable.userId,
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
        userId: apiKeysTable.userId,
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
  findByUserId: async (userId: string) => {
    const rows = await db.query.apiKeysTable.findMany({
      where: and(eq(apiKeysTable.userId, userId), eq(apiKeysTable.active, true)),
      with: {
        user: true,
      },
    });

    if (!rows || !Array.isArray(rows)) {
      return [];
    }

    const filteredRows = rows.filter((key) => key.active);
    return filteredRows.map((res) => ({
      id: res.id,
      name: res.name,
      userId: res.userId,
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
});
