import type { AppRouter } from '@server/router/_app'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { App } from 'vue'
export function createTRPCPlugin({
  apiKey,
  url,
}: {
  apiKey: string
  url: string
}) {
  const trpc = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url,
        headers: () => ({
          'x-api-key': apiKey,
        }),
      }),
    ],
  })

  return {
    install(app: App) {
      app.config.globalProperties.$trpc = trpc
    },
  }
}
