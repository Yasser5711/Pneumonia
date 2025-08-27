import { nextTick, ref } from 'vue'

import { usePreferredDark } from '@vueuse/core'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

import { useThemeStore } from '../stores/themeStore'

vi.mock('@vueuse/core', async () => {
  const actual =
    await vi.importActual<typeof import('@vueuse/core')>('@vueuse/core')
  return {
    ...actual,
    usePreferredDark: vi.fn(),
  }
})

function mockSystemDark(value: boolean) {
  const mocked = usePreferredDark as unknown as Mock
  const systemDarkRef = ref(value)
  mocked.mockReturnValue(systemDarkRef)
  return systemDarkRef
}

describe('useThemeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.documentElement.classList.remove('dark')
    localStorage.clear()
  })

  it('should default to auto and resolve from system preference', async () => {
    const systemPref = mockSystemDark(true)
    const store = useThemeStore()

    await nextTick()

    expect(store.themeMode.mode).toBe('auto')
    expect(store.resolvedTheme).toBe('dark')
    expect(store.isDark).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    systemPref.value = false
    await nextTick()

    expect(store.resolvedTheme).toBe('light')
    expect(store.isDark).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('should apply manually set themeMode and ignore system', async () => {
    mockSystemDark(false)
    const store = useThemeStore()

    store.themeMode.mode = 'dark'
    await nextTick()

    expect(store.resolvedTheme).toBe('dark')
    expect(store.isDark).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    store.themeMode.mode = 'light'
    await nextTick()

    expect(store.resolvedTheme).toBe('light')
    expect(store.isDark).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('cycleTheme should rotate light → dark → auto → light', async () => {
    mockSystemDark(true)
    const store = useThemeStore()

    store.themeMode.mode = 'light'
    store.cycleTheme()
    expect(store.themeMode.mode).toBe('dark')

    store.cycleTheme()
    expect(store.themeMode.mode).toBe('auto')

    store.cycleTheme()
    expect(store.themeMode.mode).toBe('light')
  })

  it('should persist themeMode using localStorage', async () => {
    mockSystemDark(false)
    const store = useThemeStore()

    store.themeMode.mode = 'dark'
    await nextTick()

    const saved = localStorage.getItem('theme')
    expect(saved).toBe('{"mode":"dark"}')
    expect(store.themeMode.mode).toBe('dark')

    setActivePinia(createPinia())
    const newStore = useThemeStore()

    expect(newStore.themeMode.mode).toBe('dark')
  })
})

describe('localeStore', () => {
  beforeEach(() => {
    mockSystemDark(false)
    setActivePinia(createPinia())
    localStorage.clear()

    document.documentElement.removeAttribute('lang')
  })

  it('should expose default locale and supported locales', async () => {
    const store = useThemeStore()
    await nextTick()
    expect(typeof store.resolvedLocale).toBe('string')
    expect(store.locales).toContain(store.resolvedLocale)

    expect(store.languageHeaders).toEqual({
      'Accept-Language': store.resolvedLocale,
    })
  })

  it('should change locale via setLocale and reflect on document.lang and i18n', async () => {
    const store = useThemeStore()
    await nextTick()
    expect(document.documentElement.getAttribute('lang')).toBe(
      store.resolvedLocale,
    )

    store.setLocale('fr')
    await nextTick()
    expect(localStorage.getItem('lang')).toBe('{"locale":"fr"}')
    expect(store.resolvedLocale).toBe('fr')
    expect(document.documentElement.getAttribute('lang')).toBe('fr')
  })

  it('should persist locale in localStorage and restore on new store instance', async () => {
    const store = useThemeStore()

    store.setLocale('fr')
    await nextTick()
    const saved = localStorage.getItem('lang')
    expect(saved).toBe('{"locale":"fr"}')

    document.documentElement.removeAttribute('lang')

    setActivePinia(createPinia())
    const newStore = useThemeStore()
    expect(newStore.resolvedLocale).toBe('fr')
    expect(document.documentElement.getAttribute('lang')).toBe('fr')
  })
})
