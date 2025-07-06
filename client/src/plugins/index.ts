/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import type { App } from 'vue'

import { createAppRouter } from '../router'
import pinia from '../stores'

import motion from './motion'
import { installTanstack } from './tanstack'
import { createTRPCPlugin } from './trpc'
import head from './unHead'
import vuetify from './vuetify'
// Types

export function registerPlugins(app: App) {
  // Install plugins
  installTanstack(app)

  app
    .use(pinia)
    .use(vuetify)
    .use(createAppRouter())
    .use(motion)
    .use(createTRPCPlugin({ url: `${import.meta.env.VITE_API_URL}/trpc` }))
    .use(head)
}
