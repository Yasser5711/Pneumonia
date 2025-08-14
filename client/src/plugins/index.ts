/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import type { App } from 'vue'

import VueRouterTransition from '@duannx/vue-router-transition'

import { createAppRouter } from '../router'
import pinia from '../stores'

// import { authClient } from './auth'
import motion from './motion'
import { installTanstack } from './tanstack'
import { createTRPCPlugin } from './trpc'
import head from './unHead'
import vuetify from './vuetify'
import '@duannx/vue-router-transition/dist/style.css' // Required styles
// Types

export function registerPlugins(app: App) {
  // Install plugins
  const router = createAppRouter()
  installTanstack(app)

  app
    .use(pinia)
    .use(vuetify)
    .use(motion)
    .use(createTRPCPlugin({ url: `${import.meta.env.VITE_API_URL}/trpc` }))
    // .use(authClient)
    .use(router)
    .use(head)
    .use(VueRouterTransition, router)
}
