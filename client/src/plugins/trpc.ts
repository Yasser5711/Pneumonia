import type { App } from 'vue'

import { createTRPCClient, httpBatchLink, type TRPCClient } from '@trpc/client'

import { useStorageStore } from '@/stores/storageStore'

import type {
  AppRouter,
  RouterInputs,
  RouterOutputs,
} from '@server/router/_app'
export { type AppRouter, type RouterInputs, type RouterOutputs }
export function createTRPCPlugin({ url }: { url: string }) {
  return {
    install(app: App) {
      const store = useStorageStore()

      const trpc: TRPCClient<AppRouter> = createTRPCClient<AppRouter>({
        links: [
          httpBatchLink({
            url,
            fetch: (input, init) =>
              fetch(input, { ...init, credentials: 'include' }),
            headers: () => {
              const key = store.getKeyFromLocalStorage('apiKey').value
              return key ? { 'x-api-key': key } : {}
            },
          }),
        ],
      })

      app.config.globalProperties.$trpc = trpc
    },
  }
}
