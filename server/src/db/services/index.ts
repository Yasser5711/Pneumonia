import { apiKeysRepo } from '@repositories/index';
import { createApiKeyService } from './apiKey.service';

export const apiKeyService = createApiKeyService(apiKeysRepo);
