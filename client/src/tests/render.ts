import { type QueryClientConfig, VueQueryPlugin } from '@tanstack/vue-query'
import {
  type RenderOptions,
  type RenderResult,
  render as renderVue,
} from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'

import { createI18nPlugin } from '@/plugins/i18n'
import motion from '@/plugins/motion'
import vuetify from '@/plugins/vuetify'

import { createTRPCPlugin } from '../plugins/trpc'
import { createAppRouter } from '../router'

interface RenderComposableOptions {
  queryClientConfig: QueryClientConfig
  trpcUrl: string
}

const defaultOptions: RenderComposableOptions = {
  queryClientConfig: {
    defaultOptions: { queries: { retry: false } },
  },
  trpcUrl: 'http://localhost:3000/trpc',
}

type InnerRenderOptions<Component> = RenderOptions<Component> & {
  baseUrl?: string
  params?: Record<string, string | number>
  trpcApiKey?: string
  trpcUrl?: string
}

export function render<Component>(
  component: Component,
  renderOptions: InnerRenderOptions<Component> = {},
): RenderResult & { router: ReturnType<typeof createAppRouter> } {
  const router = createAppRouter(renderOptions.baseUrl || '/')

  if (renderOptions.params) {
    router.currentRoute.value.params = renderOptions.params
  }
  const trpcPlugin = createTRPCPlugin({
    url: renderOptions.trpcUrl || defaultOptions.trpcUrl,
  })
  const i18n = createI18nPlugin()
  return {
    ...renderVue(component, {
      ...renderOptions,
      global: {
        ...renderOptions.global,
        plugins: [
          [
            VueQueryPlugin,
            { queryClientConfig: defaultOptions.queryClientConfig },
          ],
          vuetify,
          motion,
          trpcPlugin,
          setActivePinia(createPinia()),
          router,
          ...(renderOptions.global?.plugins ?? []),
          i18n,
        ],
      },
    }),
    router,
  }
}
