// src/plugins/trpc.ts
import type { AppRouter } from '@server/router/_app' // ⬅️ adjust path as needed
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { App } from 'vue'

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
      headers: () => ({
        'x-api-key': 'my-secret-api-key',
      }),
    }),
  ],
})

export function installTRPC(app: App) {
  // Optional: add to globalProperties for easier access if needed
  app.config.globalProperties.$trpc = trpc
}
