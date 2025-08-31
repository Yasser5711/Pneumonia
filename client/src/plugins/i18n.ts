import { createI18n } from 'vue-i18n'
import { en as vuetifyEn, fr as vuetifyFr } from 'vuetify/locale'

import enL from '@/locales/en.json'
import frL from '@/locales/fr.json'

const i18nConfig = {
  legacy: false as const,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: { $vuetify: vuetifyEn, ...enL },
    fr: { $vuetify: vuetifyFr, ...frL },
  },
  missingWarn: import.meta.env.MODE !== 'production',
  fallbackWarn: import.meta.env.MODE !== 'production',
}
export const i18n = createI18n(i18nConfig)
export function createI18nPlugin() {
  return createI18n(i18nConfig)
}
