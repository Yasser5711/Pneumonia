/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import { createAppRouter } from '../router'
import pinia from '../stores'
import motion from './motion'
import { installTanstack } from './tanstack'
import { createTRPCPlugin } from './trpc'
import vfm from './vfm'
import vuetify from './vuetify'
// Types
import type { App } from 'vue'

export function registerPlugins(app: App) {
  // Install plugins
  installTanstack(app)

  app
    .use(pinia)
    .use(vuetify)
    .use(createAppRouter())
    .use(motion)
    .use(vfm)
    .use(createTRPCPlugin({ url: `${import.meta.env.VITE_API_URL}/trpc` }))
}
