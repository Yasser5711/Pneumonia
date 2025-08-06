import { computed, ref, watch } from 'vue'

import { usePreferredDark } from '@vueuse/core'
import { defineStore } from 'pinia'

import { useStorageStore } from './storageStore'
export type ThemeMode = 'light' | 'dark' | 'auto'

export const useThemeStore = defineStore('theme', () => {
  const storageStore = useStorageStore()
  const systemPrefersDark = usePreferredDark()
  const themeMode = storageStore.getKeyFromLocalStorage('theme', {
    mode: 'auto',
  })
  const isDark = ref<boolean>(false)

  const resolvedTheme = computed(() => {
    if (themeMode.value.mode === 'auto') {
      return systemPrefersDark.value ? 'dark' : 'light'
    }
    return themeMode.value.mode
  })

  const applyTheme = () => {
    document.documentElement.classList.toggle('dark', isDark.value)
  }

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
