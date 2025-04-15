import type { TRPCClient } from '@trpc/client'

import type { AppRouter } from '@server/router/_app'

export const MOCK_TRPC: Partial<TRPCClient<AppRouter>> = {
  predictPneumonia: {
    mutate: () =>
      Promise.resolve({
        data: { image_array: [[[0]]] },
        model: 'example-model',
        model_version: '1.0',
        prediction: { class: 'example-class', probability: 0.99 },
      }),
  },
  helloWorldRouter: {
    query: (input: { name?: string }) =>
      Promise.resolve({
        message: `Hello, ${input?.name ?? 'Guest'}!`,
      }),
  },
}
