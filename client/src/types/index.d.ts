import type { AppRouter } from '@server/router/_app'
import type { TRPCClient } from '@trpc/client'
import 'vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    $trpc: TRPCClient<AppRouter>
  }
}
