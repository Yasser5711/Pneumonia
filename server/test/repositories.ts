import { mockDeep, type DeepMockProxy } from 'vitest-mock-extended';

import type { createApiKeysRepo } from '../src/db/repositories/apiKey.repository';
import type { createUsersRepo } from '../src/db/repositories/user.repository';

type ApiKeyRepo = ReturnType<typeof createApiKeysRepo>;
type UserRepo = ReturnType<typeof createUsersRepo>;

export const mockApiKeyRepo: DeepMockProxy<ApiKeyRepo> = mockDeep<ApiKeyRepo>();
export const mockUserRepo: DeepMockProxy<UserRepo> = mockDeep<UserRepo>();
// ts-prune-ignore-next
export const mockRepositories = {
  apiKeysRepo: mockApiKeyRepo,
  usersRepo: mockUserRepo,
};
