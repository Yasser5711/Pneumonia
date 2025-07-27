import { eq, type InferSelectModel, type InferInsertModel, and } from 'drizzle-orm';

import { db as DB } from '../index';
import { apiKeys as apiKeysTable, users as usersTable } from '../schema/auth';

import type * as schema from '../schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

type DrizzleDB = PostgresJsDatabase<typeof schema>;
export type ApiKey = InferSelectModel<typeof apiKeysTable>;
export type ApiKeyInsert = InferInsertModel<typeof apiKeysTable>;
export type ApiKeyWithUserQuota = ApiKey & {
  user: {
    requestsQuota: number;
    requestsUsed: number;
  };
};
export const createNewApiKeysRepo = (db: DrizzleDB = DB) => ({
  /**
   * List all API keys for a specific user (for management views).
   */
  findByUserId: async ({
    userId,
    includeDisabled = false,
  }: {
    userId: string;
    includeDisabled?: boolean;
  }): Promise<ApiKey[]> => {
    const conditions = [eq(apiKeysTable.userId, userId)];
    if (!includeDisabled) {
      conditions.push(eq(apiKeysTable.enabled, true));
    }

    return await db.query.apiKeys.findMany({
      where: and(...conditions),
    });
  },
  /**
   * Update enabled for API keys
   */
  disableMyKeys: async (userId: string) => {
    return await db
      .update(apiKeysTable)
      .set({ enabled: false })
      .where(eq(apiKeysTable.userId, userId))
      .returning();
  },
  /**
   * Get Quota of an API key.
   */
  getQuota: async (keyId: string) => {
    return await db
      .select({
        keyId: apiKeysTable.id,
        userId: apiKeysTable.userId,
        requestsQuota: usersTable.requestsQuota,
        requestsUsed: usersTable.requestsUsed,
      })
      .from(apiKeysTable)
      .leftJoin(usersTable, eq(apiKeysTable.userId, usersTable.id))
      .where(eq(apiKeysTable.id, keyId))
      .then((rows) => rows[0]);
  },
});
