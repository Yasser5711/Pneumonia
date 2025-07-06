import type { App } from 'vue'

import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

export const queryClient = new QueryClient()

export function installTanstack(app: App) {
  app.use(VueQueryPlugin, { queryClient })
}
