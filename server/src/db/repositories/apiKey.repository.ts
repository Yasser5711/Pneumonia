import { eq, InferInsertModel } from 'drizzle-orm';
import { db } from '../index';
import { apiKeysTable } from '../schema';
type ApiKeyInsert = InferInsertModel<typeof apiKeysTable>;
export const apiKeysRepo = {
  create: async (
    data: Pick<ApiKeyInsert, 'name' | 'hashedKey' | 'keyPrefix'> &
      Partial<Omit<ApiKeyInsert, 'name' | 'hashedKey' | 'keyPrefix'>>,
  ) => {
    return db.insert(apiKeysTable).values(data).returning({
      id: apiKeysTable.id,
      name: apiKeysTable.name,
      hashedKey: apiKeysTable.hashedKey,
      keyPrefix: apiKeysTable.keyPrefix,
      expiresAt: apiKeysTable.expiresAt,
      active: apiKeysTable.active,
      description: apiKeysTable.description,
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
      active: res.active,
      description: res.description,
    }));
  },

  updateUsage: async ({ id, updates }: { id: string; updates: Partial<ApiKeyInsert> }) => {
    return db.update(apiKeysTable).set(updates).where(eq(apiKeysTable.id, id)).returning({
      id: apiKeysTable.id,
      name: apiKeysTable.name,
      hashedKey: apiKeysTable.hashedKey,
      expiresAt: apiKeysTable.expiresAt,
      active: apiKeysTable.active,
      description: apiKeysTable.description,
    });
  },
};
