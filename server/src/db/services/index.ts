import { apiKeysRepo, usersRepo } from '../repositories';

import { createApiKeyService } from './apiKey.service';
import { createUserService } from './user.service';
export const apiKeyService = createApiKeyService(apiKeysRepo);
export const userService = createUserService(usersRepo);
export type Services = {
  apiKeyService: typeof apiKeyService;
  userService: typeof userService;
};
