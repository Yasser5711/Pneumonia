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
      const storage = useStorageStore()
      const theme = useThemeStore()
      const apiKeyRef = storage.getKeyFromLocalStorage('apiKey')

      const langHeaders = theme.languageHeaders
      const makeHeaders = () => ({
        ...(apiKeyRef.value ? { 'x-api-key': apiKeyRef.value } : {}),
        ...langHeaders,
      })
      const http = httpBatchLink({
        transformer: SuperJSON,
        url,
        fetch: (input, init) =>
          fetch(input, { ...init, credentials: 'include' } as RequestInit),
        headers: makeHeaders,
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
