/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import { useThemeStore } from '@/stores/themeStore'
import '@mdi/font/css/materialdesignicons.css'
import { watch } from 'vue'
import 'vuetify/styles'
// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
const vuetify = createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {}, // use Vuetify defaults
      dark: {}, // use Vuetify defaults
    },
  },
})
export default {
  install(app: any) {
    app.use(vuetify)

    const themeStore = useThemeStore()

    watch(
      () => themeStore.resolvedTheme,
      (val) => {
        vuetify.theme.global.name.value = val
      },
      { immediate: true },
    )
  },
}
