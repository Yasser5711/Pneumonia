import { computed, ref, watch } from 'vue'

import { usePreferredDark } from '@vueuse/core'
import { defineStore } from 'pinia'

import { i18n } from '@/plugins/i18n'
import type { LangState } from '@/types/app'

import { useStorageStore } from './storageStore'

export type ThemeMode = 'light' | 'dark' | 'auto'

function normalizeBrowserLocale(input: string | undefined): LangState {
  if (!input) return { locale: 'en' }
  const [base] = input.split('-')
  return { locale: base as LangState['locale'] }
}
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

  const locales = ref<LangState['locale'][]>(['en', 'fr'])
  const defaultLocale = normalizeBrowserLocale(
    typeof navigator !== 'undefined' ? navigator.language : undefined,
  )

  const lang = storageStore.getKeyFromLocalStorage('lang', {
    locale: defaultLocale.locale,
  })

  const resolvedLocale = computed<LangState['locale']>(
    () => lang.value.locale as LangState['locale'],
  )

  const applyLocale = (locale: LangState['locale']) => {
    // vue-i18n v9: reactive locale
    i18n.global.locale.value = locale
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', locale)
    }
  }

  watch(
    resolvedLocale,
    (val) => {
      applyLocale(val)
    },
    { immediate: true },
  )

  const setLocale = (locale: LangState['locale']) => {
    lang.value.locale = locale
  }

  const languageHeaders = computed(() => {
    return { 'Accept-Language': `${resolvedLocale.value}` }
  })

  return {
    themeMode,
    resolvedTheme,
    isDark,
    cycleTheme,

    lang,
    locales,
    resolvedLocale,
    setLocale,
    languageHeaders,
  }
})
