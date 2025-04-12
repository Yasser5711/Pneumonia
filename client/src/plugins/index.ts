/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import router from "../router";
import pinia from "../stores";
import motion from "./motion";
import vfm from "./vfm";
import vuetify from "./vuetify";

// Types
import type { App } from "vue";

export function registerPlugins(app: App) {
  app.use(pinia).use(vuetify).use(router).use(motion).use(vfm);
}
