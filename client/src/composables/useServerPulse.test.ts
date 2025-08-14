import { describe, it, expect, vi, beforeEach } from 'vitest'

import { renderComposable } from '../tests/renderComposable'
import { MOCK_TRPC } from '../tests/trpc'

import { useServerPulse } from './useServerPulse'
let currentTrpc = MOCK_TRPC

vi.mock('@/plugins/trpc', () => {
  return {
    getTRPCClient: () => currentTrpc,
  }
})

const flush = () => new Promise((r) => setTimeout(r, 0))

beforeEach(() => {
  currentTrpc = MOCK_TRPC
})

describe('useServerPulse', () => {
  it('starts, receives events, and goes to "checking" after onComplete', async () => {
    const [pulse] = renderComposable(useServerPulse)

    const ok = await pulse.start({ showModal: false, bpm: 72 })
    expect(ok).toBe(true)

    await flush()

    expect(pulse.lastBeatAt.value).not.toBeNull()
    expect(pulse.bpm.value).toBeGreaterThan(0)
    expect(pulse.status.value).toBe('checking')
    expect(pulse.isLive.value).toBe(true)
  })

  it('goes to "down" when checkPulse fails', async () => {
    const failingTrpc = {
      ...MOCK_TRPC,
      healthRouter: {
        ...MOCK_TRPC.healthRouter!,
        checkPulse: {
          query: () => Promise.reject(new Error('server down')),
        },
      },
    }

    currentTrpc = failingTrpc

    const [pulse] = renderComposable(useServerPulse)

    const ok = await pulse.start({
      showModal: false,
      maxAttempts: 1,
      maxMs: 10,
      baseDelayMs: 1,
      maxDelayMs: 1,
    })

    expect(ok).toBe(false)
    expect(pulse.status.value).toBe('down')
    expect(pulse.lastError.value).toBeInstanceOf(Error)
  })

  it('reset brings the store back to idle and clears data', async () => {
    const [pulse] = renderComposable(useServerPulse)

    await pulse.start({ showModal: false })
    await flush()

    expect(pulse.lastBeatAt.value).not.toBeNull()

    pulse.reset()

    expect(pulse.status.value).toBe('idle')
    expect(pulse.lastError.value).toBeNull()
    expect(pulse.isLive.value).toBe(false)
    expect(pulse.lastBeatAt.value).toBeNull()
  })

  it('close sets open to false', () => {
    const [pulse] = renderComposable(useServerPulse)

    pulse.open.value = true
    pulse.close()
    expect(pulse.open.value).toBe(false)
  })
})
