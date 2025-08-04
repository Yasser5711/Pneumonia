import { mockDeep, type DeepMockProxy } from 'vitest-mock-extended';

import type { createNewApiKeysRepo } from '../src/db/repositories/apiKey.new.repository';
import type { createApiKeysRepo } from '../src/db/repositories/apiKey.repository';
import type { createNewUsersRepo } from '../src/db/repositories/user.new.repository';
import type { createUsersRepo } from '../src/db/repositories/user.repository';
type ApiKeyRepo = ReturnType<typeof createApiKeysRepo>;
type UserRepo = ReturnType<typeof createUsersRepo>;
type NewApiKeyRepo = ReturnType<typeof createNewApiKeysRepo>;
type NewUserRepo = ReturnType<typeof createNewUsersRepo>;

export const mockApiKeyRepo: DeepMockProxy<ApiKeyRepo> = mockDeep<ApiKeyRepo>();
export const mockUserRepo: DeepMockProxy<UserRepo> = mockDeep<UserRepo>();
export const mockNewApiKeyRepo: DeepMockProxy<NewApiKeyRepo> = mockDeep<NewApiKeyRepo>();
export const mockNewUserRepo: DeepMockProxy<NewUserRepo> = mockDeep<NewUserRepo>();
// ts-prune-ignore-next
export const mockRepositories = {
  apiKeysRepo: mockApiKeyRepo,
  usersRepo: mockUserRepo,
  newApiKeysRepo: mockNewApiKeyRepo,
  newUsersRepo: mockNewUserRepo,
};
