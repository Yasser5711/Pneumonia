import { mockDeep, type DeepMockProxy } from 'vitest-mock-extended';

import type { createNewApiKeyService } from '../src/db/services/apiKey.new.service';
import type { createApiKeyService } from '../src/db/services/apiKey.service';
import type { createNewUserService } from '../src/db/services/user.new.service';
import type { createUserService } from '../src/db/services/user.service';

type ApiKeyService = ReturnType<typeof createApiKeyService>;
type UserService = ReturnType<typeof createUserService>;
type NewApiKeyService = ReturnType<typeof createNewApiKeyService>;
type NewUserService = ReturnType<typeof createNewUserService>;

/**
 * @deprecated Use `mockNewApiKeyService` instead
 */
export const mockApiKeyService: DeepMockProxy<ApiKeyService> = mockDeep<ApiKeyService>();
/**
 * @deprecated Use `mockNewUserService` instead
 */
export const mockUserService: DeepMockProxy<UserService> = mockDeep<UserService>();
export const mockNewApiKeyService: DeepMockProxy<NewApiKeyService> = mockDeep<NewApiKeyService>();
export const mockNewUserService: DeepMockProxy<NewUserService> = mockDeep<NewUserService>();

export const mockServices = {
  apiKeyService: mockApiKeyService,
  userService: mockUserService,
  newApiKeyService: mockNewApiKeyService,
  newUserService: mockNewUserService,
};
