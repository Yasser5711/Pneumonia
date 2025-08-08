import { eq, ne, type InferSelectModel, type InferInsertModel, and } from 'drizzle-orm';

import { QuotaExceededNoExistingKeyError } from '../../errors';
import { auth } from '../../utils/auth';
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
   * List all API keys for a specific user.
   * @param userId - The UUID of the user.
   * @param includeDisabled - Whether to include disabled API keys.
   * @returns An array of API keys.
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
   * @param userId - The UUID of the user.
   * @returns An array of updated API keys.
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
   * @param keyId - The UUID of the API key.
   * @returns An object containing the key ID, user ID, requests quota, and requests used.
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
  /**
   * Create a new API key for a user.
   * If the user's quota is exceeded, it will return the existing key.
   * @param userId - The UUID of the user.
   * @param name - Optional name for the API key.
   * @param expiresIn - Optional expiration time in seconds (default is 30 days).
   * @returns An object containing the API key.
   */
  create: async ({
    userId,
    name,
    expiresIn = 30 * 24 * 60 * 60,
  }: {
    userId: string;
    name?: string;
    expiresIn?: number;
  }) => {
    return await db.transaction(async (tx) => {
      const user = await tx
        .select({
          requestsQuota: usersTable.requestsQuota,
          requestsUsed: usersTable.requestsUsed,
        })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .then((rows) => rows[0]);

      const isQuotaExceeded =
        user?.requestsQuota !== undefined && user.requestsUsed >= user.requestsQuota;

      if (isQuotaExceeded) {
        const existingKey = await tx
          .select({
            key: apiKeysTable.key,
            id: apiKeysTable.id,
          })
          .from(apiKeysTable)
          .where(eq(apiKeysTable.userId, userId))
          .then((rows) => rows[0]);

        if (!existingKey) {
          throw new QuotaExceededNoExistingKeyError(userId);
        }

        return existingKey;
      }

      const { key, id: newId } = await auth.api.createApiKey({
        body: {
          userId,
          name,
          expiresIn,
          prefix: 'pneumonia_',
        },
      });

      await tx
        .update(apiKeysTable)
        .set({ enabled: false })
        .where(and(eq(apiKeysTable.userId, userId), ne(apiKeysTable.id, newId)));

      return { key };
    });
  },
});
