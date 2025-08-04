/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router/auto'
import { routes } from 'vue-router/auto-routes'

// import { authClient } from '../lib/auth'
import { useAuthStore } from '../stores/auth'

import type { RouteLocationNormalized } from 'vue-router'
export function createAppRouter(baseUrl: string = import.meta.env.BASE_URL) {
  const router = createRouter({
    history: createWebHistory(baseUrl),
    routes: setupLayouts([
      ...routes,
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../pages/404.vue'),
        meta: {
          title: '404 - Page Not Found',
          icon: '/icons/404.png',
          description: 'The page you are looking for does not exist',
          layout: 'default',
        },
      },
    ]),
  })
  router.beforeEach(async (to, _from) => {
    if (to.matched.some((r) => r.meta.disabled)) {
      return { name: 'NotFound', replace: true }
    }
    const auth = useAuthStore()
    if (auth.sessionRef.isPending) {
      await new Promise((resolve) => {
        const unwatch = watch(
          () => auth.sessionRef.isPending,
          (pending) => {
            if (!pending) {
              unwatch()
              resolve(null)
            }
          },
        )
      })
    }
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return { name: 'SignIn', query: { redirect: to.fullPath } }
    }

    if (to.meta.guestOnly) {
      const res = await auth.refresh()
      if (res != null) {
        return { name: 'ChatPage' }
      }
    }
    return true
  })
  router.afterEach((to: RouteLocationNormalized) => {
    const { title, description, icon } = to.meta as {
      title?: string
      description?: string
      icon?: string
    }

    if (title) document.title = title

    if (description) {
      let desc = document.querySelector("meta[name='description']")
      if (!desc) {
        desc = document.createElement('meta')
        desc.setAttribute('name', 'description')
        document.head.appendChild(desc)
      }
      desc.setAttribute('content', description)
    }

    if (icon) {
      let link = document.querySelector("link[rel~='icon']")
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'icon')
        document.head.appendChild(link)
      }
      link.setAttribute('href', icon)
    }
  })
  // Workaround for https://github.com/vitejs/vite/issues/11804
  router.onError((err: Error, to: RouteLocationNormalized) => {
    if (
      err?.message?.includes?.('Failed to fetch dynamically imported module')
    ) {
      if (!localStorage.getItem('vuetify:dynamic-reload')) {
        // eslint-disable-next-line no-console
        console.log('Reloading page to fix dynamic import error')
        localStorage.setItem('vuetify:dynamic-reload', 'true')
        location.assign(to.fullPath)
      } else {
        console.error(
          'Dynamic import error, reloading page did not fix it',
          err,
        )
      }
    } else {
      console.error(err)
    }
  })

  router.isReady().then(() => {
    localStorage.removeItem('vuetify:dynamic-reload')
  })

  // router.removeRoute('IndexPage')
  return router
}

// export default router
