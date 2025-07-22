import { eq, type InferSelectModel, type InferInsertModel, and } from 'drizzle-orm';

import { db as DB } from '../index';
import { apiKeys as apiKeysTable } from '../schema/auth';

import type * as schema from '../schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

type DrizzleDB = PostgresJsDatabase<typeof schema>;
export type ApiKey = InferSelectModel<typeof apiKeysTable>;
export type ApiKeyInsert = InferInsertModel<typeof apiKeysTable>;

export const createNewApiKeysRepo = (db: DrizzleDB = DB) => ({
  /**
   * List all API keys for a specific user (for management views).
   */
  findByUserId: async (userId: string, includeDisabled: boolean = false): Promise<ApiKey[]> => {
    const conditions = [eq(apiKeysTable.userId, userId)];
    if (!includeDisabled) {
      conditions.push(eq(apiKeysTable.enabled, true));
    }

    return await db.query.apiKeys.findMany({
      where: and(...conditions),
    });
  }, //return all user's API keys, after disable all after create the new one service will handle create.
});
