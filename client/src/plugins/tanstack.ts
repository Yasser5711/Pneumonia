import type { App } from 'vue'

import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { toast } from 'vuetify-sonner'

import { parseError } from '@/utils/error'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        onError: (err) => toast.error(parseError(err)),
      },
    },
  })
}
export const queryClient = createQueryClient()

export function installTanstack(app: App) {
  app.use(VueQueryPlugin, { queryClient })
}
