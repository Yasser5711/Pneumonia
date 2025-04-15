import { useThemeStore } from '@/stores/themeStore'
import { usePreferredDark } from '@vueuse/core'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { nextTick, ref } from 'vue'

vi.mock('@vueuse/core', async () => {
  const actual = await vi.importActual<typeof import('@vueuse/core')>('@vueuse/core')
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

    expect(store.themeMode).toBe('auto')
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

    store.themeMode = 'dark'
    await nextTick()

    expect(store.resolvedTheme).toBe('dark')
    expect(store.isDark).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    store.themeMode = 'light'
    await nextTick()

    expect(store.resolvedTheme).toBe('light')
    expect(store.isDark).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('cycleTheme should rotate light → dark → auto → light', async () => {
    mockSystemDark(true)
    const store = useThemeStore()

    store.themeMode = 'light'
    store.cycleTheme()
    expect(store.themeMode).toBe('dark')

    store.cycleTheme()
    expect(store.themeMode).toBe('auto')

    store.cycleTheme()
    expect(store.themeMode).toBe('light')
  })

  it('should persist themeMode using localStorage', async () => {
    mockSystemDark(false)
    const store = useThemeStore()

    store.themeMode = 'dark'
    await nextTick()

    const saved = localStorage.getItem('theme-mode')
    expect(saved).toBe('dark')

    setActivePinia(createPinia())
    const newStore = useThemeStore()

    expect(newStore.themeMode).toBe('dark')
  })
})
