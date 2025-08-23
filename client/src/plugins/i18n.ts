import { createI18n } from 'vue-i18n'
import { en as vuetifyEn, fr as vuetifyFr } from 'vuetify/locale'

import enL from '@/locales/en.json'
import frL from '@/locales/fr.json'
export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: { $vuetify: vuetifyEn, ...enL },
    fr: { $vuetify: vuetifyFr, ...frL },
  },
  missingWarn: import.meta.env.MODE !== 'production',
  fallbackWarn: import.meta.env.MODE !== 'production',
})
