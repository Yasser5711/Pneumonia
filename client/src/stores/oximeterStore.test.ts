import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useOximeterStore } from './oximeterStore'

describe('useOximeterStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should start with default values', () => {
    const store = useOximeterStore()
    expect(store.beats).toEqual([])
    expect(store.lastBeatAt).toBeNull()
    expect(store.avgIbiMs).toBe(900)
    expect(typeof store.bpm).toBe('number')
  })

  it('should calculate IBI when lastBeatAt is set', () => {
    const store = useOximeterStore()
    const first = Date.now()
    store.pushBeat(first)

    const second = first + 1000
    store.pushBeat(second)

    expect(store.avgIbiMs).not.toBe(900)
    expect(store.beats.length).toBe(2)
  })

  it('should trim beats older than WINDOW_MS', () => {
    const store = useOximeterStore()
    const now = Date.now()

    store.pushBeat(now - store.WINDOW_MS - 100)
    store.pushBeat(now)

    expect(store.beats.length).toBe(1)
    expect(store.beats[0]).toBeGreaterThan(now - store.WINDOW_MS)
  })
  it('should cap the beats array to MAX_BEATS (drops oldest)', () => {
    const store = useOximeterStore()
    const start = Date.now()
    const total = 12
    for (let i = 0; i < total; i++) {
      store.pushBeat(start + i * 100)
    }
    expect(store.beats.length).toBe(10)
    const expectedFirstKept = start + (total - 10) * 100 // i = 2
    const expectedLastKept = start + (total - 1) * 100 // i = 11
    expect(store.beats[0]).toBe(expectedFirstKept)
    expect(store.beats[store.beats.length - 1]).toBe(expectedLastKept)
  })

  it('should reset back to defaults', () => {
    const store = useOximeterStore()
    store.pushBeat(Date.now())
    store.reset()

    expect(store.beats).toEqual([])
    expect(store.lastBeatAt).toBeNull()
    expect(store.avgIbiMs).toBe(900)
  })
})
