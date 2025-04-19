/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router/auto'
import { routes } from 'vue-router/auto-routes'

export function createAppRouter(baseUrl: string = import.meta.env.BASE_URL) {
  const router = createRouter({
    history: createWebHistory(baseUrl),
    routes: setupLayouts([
      ...routes,
      {
        path: '/',
        component: () => import('@/pages/IndexPage.vue'),
      },
    ]),
  })

  // Workaround for https://github.com/vitejs/vite/issues/11804
  router.onError((err, to) => {
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
