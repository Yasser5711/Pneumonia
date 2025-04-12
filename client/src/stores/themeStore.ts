import { usePreferredDark, useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'

export const useThemeStore = defineStore('theme', () => {
  const systemPrefersDark = usePreferredDark() // reactive system theme
  const themeMode = useStorage<ThemeMode>('theme-mode', 'auto') // persistent
  const isDark = ref<boolean>(false)

  // Computed actual theme in use
  const resolvedTheme = computed(() => {
    if (themeMode.value === 'auto') {
      return systemPrefersDark.value ? 'dark' : 'light'
    }
    return themeMode.value
  })

  // Apply class to <html>
  const applyTheme = () => {
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  // Watch for resolved theme changes
  watch(
    resolvedTheme,
    val => {
      isDark.value = val === 'dark'
      applyTheme()
    },
    { immediate: true }
  )

  // Manual toggle (light ↔ dark ↔ auto)
  const cycleTheme = () => {
    themeMode.value =
      themeMode.value === 'light' ? 'dark' : themeMode.value === 'dark' ? 'auto' : 'light'
  }

  return {
    themeMode,
    resolvedTheme,
    isDark,
    cycleTheme,
  }
})
