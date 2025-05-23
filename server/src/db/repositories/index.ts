import { db } from '../index';
import { createApiKeysRepo } from '../repositories/apiKey.repository';

export const apiKeysRepo = createApiKeysRepo(db);
export type Repositories = {
  apiKeysRepo: ReturnType<typeof createApiKeysRepo>;
};
