import { mockDeep, type DeepMockProxy } from 'vitest-mock-extended';

import type { createApiKeyService } from '../src/db/services/apiKey.service';
import type { createUserService } from '../src/db/services/user.service';

type ApiKeyService = ReturnType<typeof createApiKeyService>;
type UserService = ReturnType<typeof createUserService>;

export const mockApiKeyService: DeepMockProxy<ApiKeyService> = mockDeep<ApiKeyService>();
export const mockUserService: DeepMockProxy<UserService> = mockDeep<UserService>();

export const mockServices = {
  apiKeyService: mockApiKeyService,
  userService: mockUserService,
};
