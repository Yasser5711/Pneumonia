import { createApiKeyService } from '@services/apiKey.service';
import { mockDeep, type DeepMockProxy } from 'vitest-mock-extended';

type ApiKeyService = ReturnType<typeof createApiKeyService>;

export const mockApiKeyService: DeepMockProxy<ApiKeyService> = mockDeep<ApiKeyService>();

export const mockServices = {
  apiKeyService: mockApiKeyService,
};
