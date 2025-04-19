import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { renderComposable } from '../tests/renderComposable'
import { useTheme } from './useTheme'

// Mock the theme store
const cycleTheme = vi.fn()
const mockThemeStore = {
  themeMode: ref<'light' | 'dark' | 'auto'>('auto'),
  resolvedTheme: ref<'light' | 'dark'>('dark'),
  isDark: ref(true),
  cycleTheme,
}

vi.mock('../stores/themeStore', () => ({
  useThemeStore: () => mockThemeStore,
}))

describe('useTheme', () => {
  beforeEach(() => {
    mockThemeStore.themeMode.value = 'auto'
    mockThemeStore.resolvedTheme.value = 'dark'
    mockThemeStore.isDark.value = true
    cycleTheme.mockClear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('returns theme store refs and cycleTheme function', () => {
    const [theme, app] = renderComposable(() => useTheme())

    expect(theme.themeMode.value).toBe('auto')
    expect(theme.resolvedTheme.value).toBe('dark')
    expect(theme.isDark.value).toBe(true)

    theme.cycleTheme()
    expect(cycleTheme).toHaveBeenCalled()
    app.unmount()
  })
})
