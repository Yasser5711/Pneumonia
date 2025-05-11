import '@mdi/font/css/materialdesignicons.css'
import { cleanup, configure } from '@testing-library/vue'
import { afterEach, beforeAll, vi } from 'vitest'
import 'vuetify/styles'

beforeAll(() => {
  configure({ testIdAttribute: 'data-test' })
})

afterEach(() => {
  vi.restoreAllMocks()
  cleanup()
})
