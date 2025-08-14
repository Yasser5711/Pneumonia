import { getTRPCClient } from '@/plugins/trpc'
import { useOximeterStore } from '@/stores/oximeterStore'

type PulseStatus = 'idle' | 'checking' | 'up' | 'down'

const DEFAULTS = {
  maxMs: 60_000,
  maxAttempts: 12,
  baseDelayMs: 500,
  maxDelayMs: 5_000,
}

const open = ref(false)
const status = ref<PulseStatus>('idle')
const lastError = ref<Error | null>(null)

const isLive = ref(false)

let subAbort: AbortController | null = null
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const spo2 = ref<number | null>(null)
const randomSpo2 = (base = 98, variance = 2) => {
  const min = base - variance
  const max = base + variance
  return Math.round(Math.random() * (max - min) + min)
}
export function useServerPulse() {
  const oxi = useOximeterStore()
  function startSubscription(bpm = 70) {
    if (isLive.value) return
    const trpc = getTRPCClient()
    subAbort = new AbortController()
    trpc.healthRouter.pulse.subscribe(
      { mode: 'beats', bpm },
      {
        signal: subAbort.signal,
        onData(ev: { type: string; ts: number; message?: string }) {
          if (ev?.type === 'beat' && typeof ev.ts === 'number') {
            oxi.pushBeat(ev.ts)
            spo2.value = randomSpo2(97, 1.5)
            if (status.value !== 'down') status.value = 'up'
          } else if (ev?.type === 'presence') {
            if (status.value !== 'down') status.value = 'up'
          }
        },
        onError(err) {
          lastError.value = err as Error
          isLive.value = false
          oxi.reset()
          status.value = 'idle'
        },
        onComplete() {
          isLive.value = false
          status.value = 'checking'
        },
        onConnectionStateChange(state) {
          if (state.error) {
            lastError.value = new Error('Connection error')
            isLive.value = false
            oxi.reset()
            status.value = 'idle'
          }
        },
      },
    )
    isLive.value = true
  }

  function stopSubscription() {
    subAbort?.abort()
    subAbort = null
    isLive.value = false
  }

  async function start(
    opts?: Partial<typeof DEFAULTS> & { showModal?: boolean; bpm?: number },
  ) {
    const {
      maxMs = DEFAULTS.maxMs,
      maxAttempts = DEFAULTS.maxAttempts,
      baseDelayMs = DEFAULTS.baseDelayMs,
      maxDelayMs = DEFAULTS.maxDelayMs,
      showModal = true,
      bpm = 72,
    } = opts ?? {}

    const trpc = getTRPCClient()
    const started = Date.now()
    let attempt = 0

    lastError.value = null
    status.value = 'checking'
    if (showModal) open.value = true

    while (attempt < maxAttempts && Date.now() - started < maxMs) {
      try {
        await trpc.healthRouter.checkPulse.query({})
        status.value = 'up'
        if (showModal) open.value = true
        startSubscription(bpm)
        return true
      } catch (err) {
        lastError.value = err as Error
        console.error('Pulse check failed:', lastError.value)
        const delay = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs)
        await sleep(delay)
        attempt += 1
      }
    }
    status.value = 'down'
    stopSubscription()
    return false
  }

  function close() {
    open.value = false
  }

  function retry() {
    return start({ showModal: true })
  }

  function reset() {
    status.value = 'idle'
    lastError.value = null
    oxi.reset()
    stopSubscription()
  }

  watch(open, (v) => {
    if (v && !isLive.value && status.value !== 'checking') {
      start({ showModal: false })
    }
  })

  return {
    open,
    status,
    lastError,

    isLive,
    lastBeatAt: computed(() => oxi.lastBeatAt),
    bpm: computed(() => oxi.bpm),
    spo2: computed(() => spo2.value),

    start,
    retry,
    close,
    stopSubscription,
    reset,
  }
}
