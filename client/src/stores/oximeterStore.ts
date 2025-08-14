import { defineStore } from 'pinia'

export const useOximeterStore = defineStore('oximeter', () => {
  const beats = ref<number[]>([])
  const lastBeatAt = ref<Date | null>(null)
  const avgIbiMs = ref(900)
  const MAX_BEATS = 10
  const WINDOW_MS = 8000

  function pushBeat(tsMs: number) {
    if (lastBeatAt.value) {
      const ibi = tsMs - lastBeatAt.value.getTime()
      const alpha = 0.2
      avgIbiMs.value = alpha * ibi + (1 - alpha) * avgIbiMs.value
    }
    lastBeatAt.value = new Date(tsMs)
    beats.value.push(tsMs)
    if (beats.value.length > MAX_BEATS) {
      beats.value.splice(0, beats.value.length - MAX_BEATS)
    }
    const cutoff = tsMs - WINDOW_MS
    while (beats.value.length && beats.value[0] < cutoff) beats.value.shift()
  }
  function reset() {
    beats.value = []
    lastBeatAt.value = null
    avgIbiMs.value = 900
  }

  const bpm = computed(() => Math.round(60_000 / Math.max(300, avgIbiMs.value)))

  return { beats, lastBeatAt, avgIbiMs, bpm, pushBeat, WINDOW_MS, reset }
})
