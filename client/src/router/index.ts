/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { setupLayouts } from 'virtual:generated-layouts'
import type { RouteLocationNormalized } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router/auto'
import { routes } from 'vue-router/auto-routes'
export function createAppRouter(baseUrl: string = import.meta.env.BASE_URL) {
  const router = createRouter({
    history: createWebHistory(baseUrl),
    routes: setupLayouts([
      ...routes,
      // {
      //   path: '/',
      //   component: () => import('@/pages/IndexPage.vue'),
      // },
      {
        path: '/:pathMatch(.*)*',
        redirect: '/chat',
      },
    ]),
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
  return router
}

// export default router
