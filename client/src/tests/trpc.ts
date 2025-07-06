import type { AppRouter } from '@server/router/_app'
import type { TRPCClient } from '@trpc/client'

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
  auth: {
    github: {
      githubStart: {
        mutate: () => {
          return Promise.resolve({
            redirectUrl:
              'https://github.com/login/oauth/authorize?client_id=MOCK',
          })
        },
      },
      githubCallback: {
        mutate: (input: { code: string; state: string }) => {
          if (input.code === 'bad') {
            return Promise.reject(new Error('GitHub callback failed'))
          }
          return Promise.resolve({
            apiKey: 'ghp_mockedApiKey123',
          })
        },
      },
    },

    google: {
      googleStart: {
        mutate: () => {
          return Promise.resolve({
            redirectUrl:
              'https://accounts.google.com/o/oauth2/auth?client_id=MOCK',
          })
        },
      },
      googleCallback: {
        mutate: (input: { code: string; state: string }) => {
          if (input.code === 'bad') {
            return Promise.reject(new Error('Google callback failed'))
          }
          return Promise.resolve({
            apiKey: 'ya29.mockedApiKey456',
          })
        },
      },
    },

    user: {
      me: {
        query: () => {
          return Promise.resolve({
            user: {
              id: 'u-1',
              email: 'user@example.com',
              provider: 'guest',
              providerId: 'user@example.com',
              createdAt: new Date('2023-01-01T00:00:00Z'),
              lastLogin: new Date('2023-01-01T00:00:00Z'),
              updatedAt: new Date('2023-01-01T00:00:00Z'),
              avatarUrl: null,
            },
            quota: { total: 10, used: 2 },
          })
        },
      },
      logout: {
        mutate: () => {
          return Promise.resolve({ success: true })
        },
      },
      generateMyKey: {
        mutate: () => {
          return Promise.resolve({ apiKey: 'new-user-key-789' })
        },
      },
    },
  },
}
