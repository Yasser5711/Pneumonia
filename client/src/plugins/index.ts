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
const trpcPlugin = createTRPCPlugin({
  apiKey: import.meta.env.VITE_API_KEY, // or wherever you pull it from
  url: 'http://localhost:3000/trpc',
})
export function registerPlugins(app: App) {
  // Install plugins
  installTanstack(app)

  app.use(pinia).use(vuetify).use(createAppRouter()).use(motion).use(vfm).use(trpcPlugin)
}
