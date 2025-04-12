import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import type { App } from 'vue'

export const queryClient = new QueryClient()

export function installTanstack(app: App) {
  app.use(VueQueryPlugin, { queryClient })
}
