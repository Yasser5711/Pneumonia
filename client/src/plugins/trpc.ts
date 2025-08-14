import type { App } from 'vue'

import {
  createTRPCClient,
  httpBatchLink,
  type TRPCClient,
  splitLink,
  httpSubscriptionLink,
} from '@trpc/client'
import SuperJSON from 'superjson'

import { useStorageStore } from '@/stores/storageStore'

import type {
  AppRouter,
  RouterInputs,
  RouterOutputs,
} from '@server/router/_app'
export { type AppRouter, type RouterInputs, type RouterOutputs }
let _trpcClient: TRPCClient<AppRouter> | null = null
export function getTRPCClient(): TRPCClient<AppRouter> {
  if (!_trpcClient) throw new Error('tRPC client not initialized yet')
  return _trpcClient
}

export function createTRPCPlugin({ url }: { url: string }) {
  return {
    install(app: App) {
      const store = useStorageStore()
      const http = httpBatchLink({
        transformer: SuperJSON,
        url,
        fetch: (input, init) =>
          fetch(input, { ...init, credentials: 'include' } as RequestInit),
        headers: () => {
          const key = store.getKeyFromLocalStorage('apiKey').value
          return key ? { 'x-api-key': key } : {}
        },
      })
      const links = [
        splitLink({
          condition: (op) => op.type === 'subscription',
          true: httpSubscriptionLink({
            url,
            transformer: SuperJSON,
          }),

          false: http,
        }),
      ]

      const trpc = createTRPCClient<AppRouter>({
        links,
      })
      _trpcClient = trpc
      app.config.globalProperties.$trpc = trpc
    },
  }
}
