import { mockDeep, type DeepMockProxy } from 'vitest-mock-extended';
import type { createApiKeysRepo } from '../src/db/repositories/apiKey.repository';

type ApiKeyRepo = ReturnType<typeof createApiKeysRepo>;

export const mockApiKeyRepo: DeepMockProxy<ApiKeyRepo> = mockDeep<ApiKeyRepo>();
// ts-prune-ignore-next
export const mockRepositories = {
  apiKeysRepo: mockApiKeyRepo,
};
