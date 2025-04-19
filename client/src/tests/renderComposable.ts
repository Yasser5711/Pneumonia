import type { AppRouter } from '@server/router/_app'
import {
  QueryClient,
  VueQueryPlugin,
  type VueQueryPluginOptions,
} from '@tanstack/vue-query'
import type { TRPCClient } from '@trpc/client'
import { createPinia } from 'pinia'
import { type App, createApp } from 'vue'
import vuetify from '../plugins/vuetify'

import { MOCK_TRPC } from './trpc'

interface RenderComposableOptions {
  trpc: Partial<TRPCClient<AppRouter>>
  queryClient: QueryClient
}

export function renderComposable<T>(
  composable: () => T,
  options: Partial<RenderComposableOptions & { useVuetify?: boolean }> = {},
): [T, App<Element>] {
  let result: T | undefined = undefined

  const innerOptions: RenderComposableOptions = {
    trpc: options.trpc ?? MOCK_TRPC,
    queryClient:
      options.queryClient ??
      new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
  }

  const app = createApp({
    setup() {
      result = composable()
      return () => {}
    },
  })

  app.use<VueQueryPluginOptions>(VueQueryPlugin, {
    queryClient: innerOptions.queryClient,
  })

  // app.provide('trpc', innerOptions.trpc)
  app.config.globalProperties.$trpc = innerOptions.trpc as TRPCClient<AppRouter>
  app.use(createPinia())
  if (options.useVuetify) {
    app.use(vuetify)
  }

  app.mount(document.createElement('div'))

  if (!result) {
    throw new Error('result must be defined.')
  }
  return [result, app]
}
