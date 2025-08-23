/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles

import '@mdi/font/css/materialdesignicons.css'
import { watch } from 'vue'

import { useI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'

import { i18n } from './i18n'

// import { VFileUpload } from 'vuetify/labs/VFileUpload'
import 'vuetify/styles'
// Composables

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
const vuetify = createVuetify({
  // components: {
  //   VFileUpload,
  // },
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n }),
  },
  defaults: {
    VTextField: {
      variant: 'underlined',
    },
    VBtn: {
      rounded: 'xs',
    },
    VSlider: {
      thumbLabel: true,
    },
    VSelect: {
      variant: 'underlined',
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
        vuetify.theme.change(val)
      },
      { immediate: true },
    )
  },
}
