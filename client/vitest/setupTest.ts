import { cleanup, configure } from '@testing-library/vue'
import { afterEach, beforeAll, vi } from 'vitest'
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'

vi.mock('vue-router', async () => {
  const actual =
    await vi.importActual<typeof import('vue-router')>('vue-router')

  const routerStub = {
    push: vi.fn(),
    replace: vi.fn(),
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
    onError: vi.fn(),
    isReady: () => Promise.resolve(),
  }

  return {
    ...actual,
    createRouter: () => routerStub,
    useRoute: vi.fn(),
    useRouter: vi.fn(() => routerStub),
  }
})

beforeAll(() => {
  configure({ testIdAttribute: 'data-test' })
})

afterEach(() => {
  vi.restoreAllMocks()
  cleanup()
})
