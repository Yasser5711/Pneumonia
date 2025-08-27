import { ref } from 'vue'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { renderComposable } from '../tests/renderComposable'

import { useLocale } from './useLocale'

const setLocale = vi.fn()
const mockThemeStore = {
  locales: ref<'en' | 'fr'>('en'),
  resolvedLocale: ref<'en' | 'fr'>('en'),
  setLocale,
}

vi.mock('../stores/themeStore', () => ({
  useThemeStore: () => mockThemeStore,
}))

describe('useLocale', () => {
  beforeEach(() => {
    mockThemeStore.locales.value = 'en'
    mockThemeStore.resolvedLocale.value = 'en'
    setLocale.mockClear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('returns theme store refs and cycleTheme function', () => {
    const [locale, app] = renderComposable(() => useLocale())

    expect(locale.locales.value).toBe('en')
    expect(locale.resolvedLocale.value).toBe('en')

    locale.setLocale('fr')
    expect(setLocale).toHaveBeenCalledWith('fr')
    app.unmount()
  })
})
