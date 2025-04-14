import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/vue'
import { afterEach, beforeAll, beforeEach, vi } from 'vitest'

beforeAll(() => {
  configure({ testIdAttribute: 'data-test' })
})

beforeEach(() => {
  class MockIntersectionObserver {
    dummy = null
    observe() {
      return this.dummy
    }
    unobserve() {
      return this.dummy
    }
    disconnect() {
      return this.dummy
    }
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  cleanup()
})
