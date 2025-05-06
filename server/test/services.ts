import { mockDeep, type DeepMockProxy } from 'vitest-mock-extended';
import { createApiKeyService } from '../src/db/services/apiKey.service';

type ApiKeyService = ReturnType<typeof createApiKeyService>;

export const mockApiKeyService: DeepMockProxy<ApiKeyService> = mockDeep<ApiKeyService>();

export const mockServices = {
  apiKeyService: mockApiKeyService,
};
