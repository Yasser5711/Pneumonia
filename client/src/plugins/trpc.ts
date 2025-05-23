import { useStorageStore } from '@/stores/storageStore'
import type { AppRouter } from '@server/router/_app'
import { createTRPCClient, httpBatchLink, type TRPCClient } from '@trpc/client'
import type { App } from 'vue'

export function createTRPCPlugin({ url }: { url: string }) {
  return {
    install(app: App) {
      const store = useStorageStore()

      const trpc: TRPCClient<AppRouter> = createTRPCClient<AppRouter>({
        links: [
          httpBatchLink({
            url,
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
