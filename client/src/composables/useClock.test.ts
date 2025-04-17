import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderComposable } from '../tests/renderComposable'
import { useClock } from './useClock'

// client/src/composables/useClock.test.ts

describe('useClock', () => {
  let setItemSpy: ReturnType<typeof vi.spyOn>
  let getItemSpy: ReturnType<typeof vi.spyOn>
  let clearIntervalSpy: ReturnType<typeof vi.spyOn>
  let setIntervalSpy: ReturnType<typeof vi.spyOn>
  const fakeInterval = 123
  let nowDate: Date

  beforeEach(() => {
    nowDate = new Date('2023-01-01T12:34:56')
    vi.useFakeTimers()
    vi.setSystemTime(nowDate)
    setItemSpy = vi.spyOn(window.localStorage.__proto__, 'setItem')
    getItemSpy = vi.spyOn(window.localStorage.__proto__, 'getItem')
    setIntervalSpy = vi.spyOn(window, 'setInterval').mockImplementation((cb, ms) => {
      return fakeInterval
    })
    clearIntervalSpy = vi.spyOn(window, 'clearInterval')
    getItemSpy.mockImplementation((key: string) => {
      if (key === 'clock-format') return null
      return null
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('defaults to 24h if localStorage is not set', () => {
    const [clock] = renderComposable(() => useClock())
    expect(clock.use12h.value).toBe(false)
  })

  it('reads 12h format from localStorage', () => {
    getItemSpy.mockImplementation((key: string) => (key === 'clock-format' ? '12' : null))
    const [clock] = renderComposable(() => useClock())
    expect(clock.use12h.value).toBe(true)
  })

  it('toggleFormat switches format and updates localStorage', () => {
    const [clock] = renderComposable(() => useClock())
    expect(clock.use12h.value).toBe(false)
    clock.toggleFormat()
    expect(clock.use12h.value).toBe(true)
    expect(setItemSpy).toHaveBeenCalledWith('clock-format', '12')
    clock.toggleFormat()
    expect(clock.use12h.value).toBe(false)
    expect(setItemSpy).toHaveBeenCalledWith('clock-format', '24')
  })

  it('timeParts reflects the current time and format', () => {
    const [clock] = renderComposable(() => useClock())
    const parts = clock.timeParts.value
    const hourPart = parts.find(p => p.type === 'hour')
    expect(hourPart?.value).toBe('12')
    clock.toggleFormat()
    const parts12 = clock.timeParts.value
    expect(parts12.find(p => p.type === 'hour')?.value).toBe('12')
  })

  it('fullDate returns the correct formatted date', () => {
    const [clock] = renderComposable(() => useClock())
    expect(clock.fullDate.value).toMatch(/Sunday, January 1, 2023/)
  })

  it('updates now every second and clears interval on unmount', () => {
    let app: any
    const [clock, _app] = renderComposable(() => useClock())
    app = _app
    const oldNow = clock.timeParts.value
    vi.advanceTimersByTime(1000)
    expect(clock.timeParts.value).not.toEqual(oldNow)
    app.unmount()
    expect(clearIntervalSpy).toHaveBeenCalledWith(fakeInterval)
  })
})
