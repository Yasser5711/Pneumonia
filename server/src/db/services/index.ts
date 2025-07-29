import { apiKeysRepo, usersRepo, newApiKeysRepo, newUsersRepo } from '../repositories';

import { createNewApiKeyService } from './apiKey.new.service';
import { createApiKeyService } from './apiKey.service';
import { createNewUserService } from './user.new.service';
import { createUserService } from './user.service';
export const apiKeyService = createApiKeyService(apiKeysRepo);
export const userService = createUserService(usersRepo);
export const newApiKeyService = createNewApiKeyService(newApiKeysRepo);
export const newUserService = createNewUserService(newUsersRepo, newApiKeyService);
export type Services = {
  apiKeyService: typeof apiKeyService;
  userService: typeof userService;
  newApiKeyService: typeof newApiKeyService;
  newUserService: typeof newUserService;
};
