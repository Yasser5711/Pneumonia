import { getCurrentInstance } from 'vue'

import { describe, expect, it, vi, type Mock } from 'vitest'

import { useTRPC } from './useTRPC'

vi.mock('vue', async (importOriginal) => {
  const vue = await importOriginal<typeof import('vue')>()
  return {
    ...vue,
    getCurrentInstance: vi.fn(),
  }
})

describe('useTRPC', () => {
  const mockedGetCurrentInstance = getCurrentInstance as unknown as Mock

  it('throws if called outside setup()', () => {
    mockedGetCurrentInstance.mockReturnValue(null)
    expect(() => useTRPC()).toThrowError(
      'useTRPC must be called inside setup()',
    )
  })

  it('returns $trpc from app context', () => {
    const mockTRPC = { query: vi.fn() }
    mockedGetCurrentInstance.mockReturnValue({
      appContext: {
        config: {
          globalProperties: {
            $trpc: mockTRPC,
          },
        },
      },
    })

    const result = useTRPC()
    expect(result).toBe(mockTRPC)
  })
})
