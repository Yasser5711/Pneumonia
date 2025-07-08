import type { App } from 'vue'

import { describe, expect, it, vi } from 'vitest'

import { installTanstack, queryClient } from './tanstack'
describe('installTanstack', () => {
  it('installs VueQueryPlugin with shared queryClient', () => {
    const app = { use: vi.fn() }

    installTanstack(app as unknown as App)

    expect(app.use).toHaveBeenCalledWith(
      expect.objectContaining({ install: expect.any(Function) }),
      { queryClient },
    )
  })
})
