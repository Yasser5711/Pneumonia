import type { AppRouter } from '@server/router/_app'
import type { TRPCClient } from '@trpc/client'
import { getCurrentInstance } from 'vue'

export function useTRPC(): TRPCClient<AppRouter> {
  const instance = getCurrentInstance()
  if (!instance) throw new Error('useTRPC must be called inside setup()')

  return instance.appContext.config.globalProperties.$trpc
}
