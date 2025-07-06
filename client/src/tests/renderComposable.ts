import { type App, createApp } from 'vue'

import {
  QueryClient,
  VueQueryPlugin,
  type VueQueryPluginOptions,
} from '@tanstack/vue-query'
import { createPinia } from 'pinia'

import { createAppRouter } from '@/router'

import vuetify from '../plugins/vuetify'

import { MOCK_TRPC } from './trpc'

import type { AppRouter } from '@server/router/_app'
import type { TRPCClient } from '@trpc/client'

interface RenderComposableOptions {
  trpc: Partial<TRPCClient<AppRouter>>
  queryClient: QueryClient
  route?: {
    name?: string
    path?: string
    query?: Record<string, string | string[]>
  }
}

export function renderComposable<T>(
  composable: () => T,
  options: Partial<RenderComposableOptions & { useVuetify?: boolean }> = {},
): [T, App<Element>, ReturnType<typeof createAppRouter>] {
  let result: T | undefined = undefined

  const innerOptions: RenderComposableOptions = {
    trpc: options.trpc ?? MOCK_TRPC,
    queryClient:
      options.queryClient ??
      new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
    route: options.route,
  }
  const router = createAppRouter('/')

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
  app.use(router)
  if (options.useVuetify) {
    app.use(vuetify)
  }

  app.mount(document.createElement('div'))

  if (!result) {
    throw new Error('result must be defined.')
  }
  return [result, app, router]
}
