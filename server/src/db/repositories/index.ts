import { db } from '../index';
import { createApiKeysRepo } from '../repositories/apiKey.repository';
import { createUsersRepo } from '../repositories/user.repository';

import { createNewApiKeysRepo } from './apiKey.new.repository';
import { createNewUsersRepo } from './user.new.repository';
export const apiKeysRepo = createApiKeysRepo(db);
export const usersRepo = createUsersRepo(db);
export const newApiKeysRepo = createNewApiKeysRepo(db);
export const newUsersRepo = createNewUsersRepo(db);

export type Repositories = {
  apiKeysRepo: ReturnType<typeof createApiKeysRepo>;
  usersRepo: ReturnType<typeof createUsersRepo>;
  newApiKeysRepo: ReturnType<typeof createNewApiKeysRepo>;
  newUsersRepo: ReturnType<typeof createNewUsersRepo>;
};
