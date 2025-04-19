import type { TRPCClient } from '@trpc/client'

import type { AppRouter } from '@server/router/_app'

export const MOCK_TRPC: Partial<TRPCClient<AppRouter>> = {
  predictPneumonia: {
    mutate: (data: { imageBase64: string }) => {
      if (data.imageBase64 === 'error') {
        return Promise.reject(new Error('Prediction failed'))
      }

      return Promise.resolve({
        data: { image_array: [[[0]]] },
        model: 'example-model',
        model_version: '1.0',
        prediction: { class: 'example-class', probability: 0.99 },
      })
    },
  },
  helloWorldRouter: {
    query: (input: { name?: string }) => {
      if (input?.name === 'error') {
        return Promise.reject(new Error('Failed to fetch hello message'))
      }
      return Promise.resolve({
        message: `Hello, ${input?.name ?? 'Guest'}!`,
      })
    },
  },
}
