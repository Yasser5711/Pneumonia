import { storeToRefs } from 'pinia'

import { useThemeStore } from '../stores/themeStore'

export const useLocale = () => {
  const themeStore = useThemeStore()
  const { locales, resolvedLocale } = storeToRefs(themeStore)

  return {
    locales,
    resolvedLocale,
    setLocale: themeStore.setLocale,
  }
}
