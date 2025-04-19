import { appRouter } from '../src/router/_app';

const MOCK_API_KEY = 'test_api_key';

export function createTestCaller(apiKey = MOCK_API_KEY) {
  return appRouter.createCaller({
    apiKey,
  });
}
