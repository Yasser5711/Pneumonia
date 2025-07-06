import { ref } from 'vue'

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from 'vitest'

import { useStorageStore } from '../stores/storageStore'
import { renderComposable } from '../tests/renderComposable'

import { useClock } from './useClock'

import type { StorageMap } from '../types/app'
import type { RemovableRef } from '@vueuse/core'

vi.mock('@/stores/storageStore', () => ({
  useStorageStore: vi.fn(),
}))

describe('useClock', () => {
  let mockClockRef: RemovableRef<StorageMap['clock']>

  beforeEach(() => {
    vi.useFakeTimers()

    mockClockRef = ref({
      local: 'en-US',
      showSeconds: true,
      showDate: true,
      options: {
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
        weekday: 'short',
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        second: '2-digit',
      },
    }) as RemovableRef<StorageMap['clock']>
    ;(useStorageStore as unknown as Mock).mockReturnValue({
      getKeyFromLocalStorage: vi.fn().mockReturnValue(mockClockRef),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetAllMocks()
  })

  it('initializes with formatted time and updates every second', async () => {
    const [clock, app] = renderComposable(() => useClock(), {
      useVuetify: false,
    })

    const initialParts = clock.timeParts.value.map((p) => p.type)

    expect(initialParts).toContain('hour')
    expect(initialParts).toContain('minute')
    expect(initialParts).toContain('second')
    expect(initialParts).toContain('weekday')
    expect(initialParts).toContain('year')

    const firstValue = clock.fullDate.value

    vi.advanceTimersByTime(1000)
    await Promise.resolve()

    const updatedValue = clock.fullDate.value
    expect(updatedValue).not.toEqual(firstValue)
    app.unmount()
  })

  it('toggles hour12 format', () => {
    const [clock, app] = renderComposable(() => useClock())

    expect(mockClockRef.value.options.hour12).toBe(false)

    clock.toggleFormat()

    expect(mockClockRef.value.options.hour12).toBe(true)
    app.unmount()
  })
})
