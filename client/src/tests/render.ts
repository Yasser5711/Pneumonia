import { type QueryClientConfig, VueQueryPlugin } from '@tanstack/vue-query'
import { type RenderOptions, type RenderResult, render as renderVue } from '@testing-library/vue'
import { createPinia } from 'pinia'

import { organizationPlugin } from '@drafts-front/plugins/organization'
import { organizationIdPlugin } from '@drafts-front/plugins/organizationId'
import { subscriptionsPlugin } from '@drafts-front/plugins/subscriptions'
import { trpcPlugin } from '@drafts-front/plugins/trpc'
import { userIdPlugin } from '@drafts-front/plugins/userId'

import { createAppRouter } from '../router'

interface RenderComposableOptions {
  organizationId: string
  organization: {
    id: string
    name: string
    logoUrl: string | null
  }
  userId: string
  queryClientConfig: QueryClientConfig
  postFormState: PostFormState
}

const defaultOptions: RenderComposableOptions = {
  organizationId: 'defaultOrganizationId',
  organization: {
    id: 'test',
    name: 'Test',
    logoUrl: null,
  },
  userId: 'defaultUserId',
  queryClientConfig: {
    defaultOptions: { queries: { retry: false } },
  },
  postFormState: INITIAL_POST_FORM_VALUE,
}

type InnerRenderOptions<Component> = RenderOptions<Component> & {
  params?: Record<string, string>
  baseUrl?: string
  postFormState?: PostFormState
  subscriptions?: string[]
}

export function render<Component>(
  component: Component,
  renderOptions: InnerRenderOptions<Component> = {}
): RenderResult & { router: ReturnType<typeof createAppRouter> } {
  i18n.loadAndActivate({ locale: 'fr', locales: ['fr'], messages: {} })
  const router = createAppRouter(renderOptions.baseUrl || '/')

  if (renderOptions.params) {
    router.currentRoute.value.params = renderOptions.params
  }

  setCurrentStore(new Store(renderOptions.postFormState || defaultOptions.postFormState))

  return {
    ...renderVue(component, {
      ...renderOptions,
      global: {
        ...renderOptions.global,
        plugins: [
          [VueQueryPlugin, { queryClientConfig: defaultOptions.queryClientConfig }],
          [linguiPlugin, { i18n }],
          [trpcPlugin, { organizationId: defaultOptions.organizationId }],
          createPinia(),
          router,
          ...(renderOptions.global?.plugins ?? []),
          [organizationIdPlugin, defaultOptions.organizationId],
          [organizationPlugin, defaultOptions.organization],
          [userIdPlugin, defaultOptions.userId],
          [subscriptionsPlugin, renderOptions.subscriptions ?? []],
        ],
      },
    }),
    router,
  }
}
