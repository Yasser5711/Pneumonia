import { and, eq, type InferInsertModel } from 'drizzle-orm';
import { db as DB } from '../index';
import { apiKeysTable, usersTable } from '../schema';

type UserInsert = InferInsertModel<typeof usersTable>;

export const createUsersRepo = (db: any = DB) => ({
  findById: async (id: string) => {
    return await db.query.usersTable.findFirst({ where: eq(usersTable.id, id) });
  },
  findByProvider: async ({
    provider,
    providerId,
  }: {
    provider: UserInsert['provider'];
    providerId: string;
  }) => {
    return await db.query.usersTable.findFirst({
      where: and(eq(usersTable.provider, provider), eq(usersTable.providerId, providerId)),
    });
  },
  create: async (
    data: Pick<UserInsert, 'email' | 'provider' | 'providerId'> &
      Partial<Omit<UserInsert, 'email' | 'provider' | 'providerId'>>,
  ) => {
    return await db.insert(usersTable).values(data).returning({
      id: usersTable.id,
      email: usersTable.email,
      provider: usersTable.provider,
      providerId: usersTable.providerId,
      createdAt: usersTable.createdAt,
      lastLogin: usersTable.lastLogin,
      updatedAt: usersTable.updatedAt,
    });
  },
  update: async ({ id, updates }: { id: string; updates: Partial<UserInsert> }) => {
    return await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning({
      id: usersTable.id,
      email: usersTable.email,
      provider: usersTable.provider,
      providerId: usersTable.providerId,
      createdAt: usersTable.createdAt,
      lastLogin: usersTable.lastLogin,
      updatedAt: usersTable.updatedAt,
    });
  },
  upgradeQuota: async ({ id, quota = 10 }: { id: string; quota?: number }) => {
    const [updated] = await db
      .update(apiKeysTable)
      .set({
        freeRequestsQuota: db.raw(`${apiKeysTable.freeRequestsQuota.name} + ?`, [quota]),
      })
      .where(eq(apiKeysTable.id, id))
      .returning();
    return updated;
  },
  getMyKeys: async (userId: string) => {
    return await db.query.apiKeysTable.findMany({
      where: eq(apiKeysTable.userId, userId),
      with: {
        user: true,
      },
    });
  },
  getMyQuota: async (userId: string) => {
    const keys = await db
      .select({
        left: apiKeysTable.freeRequestsQuota,
        used: apiKeysTable.freeRequestsUsed,
      })
      .from(apiKeysTable)
      .where(eq(apiKeysTable.userId, userId))
      .andWhere({
        active: true,
      });
    return keys[keys.length - 1] || { left: 0, used: 0 };
  },
});
