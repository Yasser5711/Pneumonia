import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { ref, type App } from 'vue'
import plugin from './vuetify'

const resolvedTheme = ref<'light' | 'dark'>('light')
vi.mock('@/stores/themeStore', () => ({
  useThemeStore: () => ({
    resolvedTheme,
  }),
}))

describe('Vuetify plugin', () => {
  beforeEach(() => {
    resolvedTheme.value = 'light'
  })

  it('installs Vuetify and sets up theme sync', async () => {
    const app = { use: vi.fn(), config: { globalProperties: {} } }

    plugin.install(app as unknown as App)

    expect(app.use).toHaveBeenCalled()

    const vuetifyInstance = (app.use as Mock).mock.calls[0][0]
    const themeRef = vuetifyInstance.theme.global.name

    expect(themeRef.value.value).toBe('light')

    resolvedTheme.value = 'dark'
    await Promise.resolve()
    expect(themeRef.value.value).toBe('dark')
  })
})
