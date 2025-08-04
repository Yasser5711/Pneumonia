/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles

import '@mdi/font/css/materialdesignicons.css'
import { watch } from 'vue'

// import { VFileUpload } from 'vuetify/labs/VFileUpload'
import 'vuetify/styles'
// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
const vuetify = createVuetify({
  // components: {
  //   VFileUpload,
  // },

  defaults: {
    VTextField: {
      variant: 'underlined',
    },
    VBtn: {
      rounded: 'xs',
    },
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          background: '#f2f2f2',
        },
      }, // use Vuetify defaults
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
