import { db } from '../index';
import { createApiKeysRepo } from '../repositories/apiKey.repository';
import { createUsersRepo } from '../repositories/user.repository';
export const apiKeysRepo = createApiKeysRepo(db);
export const usersRepo = createUsersRepo(db);
export type Repositories = {
  apiKeysRepo: ReturnType<typeof createApiKeysRepo>;
  usersRepo: ReturnType<typeof createUsersRepo>;
};
