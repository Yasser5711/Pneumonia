import type { Repositories } from '../repositories/index';

export const createUserService = (repo: Repositories['usersRepo']) => ({
  findById: async (id: string) => {
    return await repo.findById(id);
  },
  createOrUpdateOAuthUser: async (
    provider: 'github' | 'google',
    providerId: string,
    email: string | null,
  ) => {
    let user = await repo.findByProvider({ provider, providerId });
    if (!user) {
      const [created] = await repo.create({ provider, providerId, email });
      user = created;
    } else {
      const [updated] = await repo.update({
        id: user.id,
        updates: { email, lastLogin: new Date() },
      });
      user = updated;
    }
    return user;
  },
  createGuest: async (gid: string) => {
    const [created] = await repo.create({ id: gid, provider: 'guest', providerId: gid });
    return created;
  },
  upgradeGuest: async ({
    gid,
    email,
    provider,
    providerId,
  }: {
    gid: string;
    email: string;
    provider: 'github' | 'google';
    providerId: string;
  }) => {
    const [updated] = await repo.update({
      id: gid,
      updates: {
        email,
        provider,
        providerId,
        lastLogin: new Date(),
        guestLastRequest: null,
      },
    });
    return updated;
  },
});
// TODO: add https://orm.drizzle.team/docs/typebox types for the service methods
