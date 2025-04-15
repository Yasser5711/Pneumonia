import { QueryClient, VueQueryPlugin, type VueQueryPluginOptions } from '@tanstack/vue-query'
import type { TRPCClient } from '@trpc/client'
import { type App, createApp } from 'vue'
import vuetify from '../plugins/vuetify'

import type { AppRouter } from '@server/router/_app'

import { MOCK_TRPC } from './trpc'

interface RenderComposableOptions {
  trpc: Partial<TRPCClient<AppRouter>>
  queryClient: QueryClient
}

export function renderComposable<T>(
  composable: () => T,
  options: Partial<RenderComposableOptions> = {}
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

  app.provide('trpc', innerOptions.trpc)
  app.use(vuetify)

  app.mount(document.createElement('div'))

  if (!result) {
    throw new Error('result must be defined.')
  }
  return [result, app]
}
