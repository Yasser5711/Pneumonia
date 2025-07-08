import { storeToRefs } from 'pinia'

import { useThemeStore } from '../stores/themeStore'

export const useTheme = () => {
  const themeStore = useThemeStore()
  const { themeMode, resolvedTheme, isDark } = storeToRefs(themeStore)

  return {
    themeMode,
    resolvedTheme,
    isDark,
    cycleTheme: themeStore.cycleTheme,
  }
}
