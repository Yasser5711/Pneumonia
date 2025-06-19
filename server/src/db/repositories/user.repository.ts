import { and, eq, type InferInsertModel } from 'drizzle-orm';
import { db as DB } from '../index';
import { usersTable } from '../schema';

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
      guestLastRequest: usersTable.guestLastRequest,
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
      guestLastRequest: usersTable.guestLastRequest,
    });
  },
});
