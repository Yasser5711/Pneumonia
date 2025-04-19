import { usePreferredDark } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useStorageStore } from './storageStore'
export type ThemeMode = 'light' | 'dark' | 'auto'

export const useThemeStore = defineStore('theme', () => {
  const storageStore = useStorageStore()
  const systemPrefersDark = usePreferredDark() // reactive system theme
  const themeMode = storageStore.getKeyFromLocalStorage('theme', {
    mode: 'auto',
  })
  const isDark = ref<boolean>(false)

  // Computed actual theme in use
  const resolvedTheme = computed(() => {
    if (themeMode.value.mode === 'auto') {
      return systemPrefersDark.value ? 'dark' : 'light'
    }
    return themeMode.value.mode
  })

  // Apply class to <html>
  const applyTheme = () => {
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  // Watch for resolved theme changes
  watch(
    resolvedTheme,
    (val) => {
      isDark.value = val === 'dark'
      applyTheme()
    },
    { immediate: true },
  )

  // Manual toggle (light ↔ dark ↔ auto)
  const cycleTheme = () => {
    themeMode.value.mode =
      themeMode.value.mode === 'light'
        ? 'dark'
        : themeMode.value.mode === 'dark'
          ? 'auto'
          : 'light'
  }

  return {
    themeMode,
    resolvedTheme,
    isDark,
    cycleTheme,
  }
})
