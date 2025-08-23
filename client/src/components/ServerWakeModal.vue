<template>
  <ResponsiveModal
    v-model="openVModel"
    :desktop="{
      persistent: true,
      'max-width': '640px',
    }"
    :mobile="{
      persistent: true,
      closable: status !== 'checking',
    }"
  >
    <v-card :elevation="8" class="overflow-hidden">
      <v-card-title class="text-h6 d-flex align-center gap-3 py-4">
        <span>{{ titleText }}</span>

        <v-chip v-if="isLive" size="x-small" color="green-accent-4" label>
          {{ liveText }}
        </v-chip>
      </v-card-title>

      <v-card-text class="pt-0">
        <div
          class="overflow-hidden rounded-lg"
          :style="{
            background: isDark ? '#0b0f16' : '#f5f7fb',
            border: isDark
              ? '1px solid rgba(255,255,255,.08)'
              : '1px solid rgba(0,0,0,.08)',
          }"
        >
          <!-- top bar -->
          <div
            class="d-flex justify-space-between align-center px-4 py-2"
            :style="{
              background: isDark ? 'rgb(255 255 255 / 3%)' : 'rgb(0 0 0 / 5%)',
            }"
          >
            <div class="d-flex align-center gap-3">
              <v-chip :color="chipColor" variant="elevated" label>
                {{ status.toUpperCase() }}
              </v-chip>
            </div>

            <div class="d-flex align-center gap-4">
              <div class="d-flex align-center gap-2">
                <v-icon size="18" :color="hrColor">mdi-heart-pulse</v-icon>
                <span class="text-caption">HR</span>
                <span class="text-button font-mono" :style="{ color: hrColor }">
                  {{ status === 'idle' ? '—' : bpm }}
                </span>
                <span class="text-caption" style="opacity: 0.6">bpm</span>
              </div>
              <div class="d-flex align-center gap-2">
                <v-icon size="18" color="cyan-lighten-2"
                  >mdi-water-percent</v-icon
                >
                <span class="text-caption" style="opacity: 0.8">SpO₂</span>
                <span class="text-button font-mono" style="color: #67e8f9">{{
                  status === 'idle' ? '—' : spo2
                }}</span>
                <span class="text-caption" style="opacity: 0.6">%</span>
              </div>
            </div>
          </div>

          <!-- waveform -->
          <div class="position-relative">
            <canvas
              ref="waveRef"
              style="display: block; width: 100%; height: 180px"
            ></canvas>

            <!-- pulsing dot -->
            <div
              ref="dotRef"
              class="pulse-dot position-absolute"
              :class="{ pulse: isPulsing && status === 'up' }"
              :style="{
                top: '10px',
                right: '10px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: dotColor,
                '--dot-color': dotColor,
                '--pulse-dur': `${ibiMs}ms`,
              }"
            />
          </div>

          <!-- message area -->
          <div class="px-4 py-3">
            <div
              v-if="status === 'idle'"
              class="text-body-2"
              style="opacity: 0.9"
            >
              {{ t('ServerWakeModal.message') }}
            </div>

            <div
              v-else-if="status === 'checking'"
              class="d-flex align-center ga-2"
            >
              <v-progress-circular
                indeterminate
                :color="hrColor"
                size="18"
                width="2"
              />
              <div class="text-body-2" style="opacity: 0.9">
                {{ t('ServerWakeModal.checking') }}
              </div>
            </div>

            <div v-else-if="status === 'down'" class="text-body-2">
              {{ t('ServerWakeModal.down') }}
              <div v-if="errorMsg" class="mt-2" style="opacity: 0.6">
                <code>{{ errorMsg }}</code>
              </div>
            </div>

            <div v-else class="text-body-2" style="opacity: 0.9">
              {{ t('ServerWakeModal.success') }}
            </div>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="justify-end px-4 py-3">
        <v-btn v-if="status === 'checking'" disabled>{{
          t('ServerWakeModal.btn.checking')
        }}</v-btn>
        <template v-else-if="status === 'down'">
          <v-btn variant="outlined" @click="retry">{{
            t('ServerWakeModal.btn.retry')
          }}</v-btn>
          <v-btn color="primary" @click="close">{{
            t('ServerWakeModal.btn.continue')
          }}</v-btn>
        </template>
        <v-btn v-else color="primary" @click="close">{{
          t('ServerWakeModal.btn.close')
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </ResponsiveModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { useServerPulse } from '@/composables/useServerPulse'
import { useTheme } from '@/composables/useTheme'

import ResponsiveModal from './ResponsiveModal.vue'
const { t } = useI18n()
const { isDark } = useTheme()

const { open, status, lastError, retry, close, isLive, lastBeatAt, bpm, spo2 } =
  useServerPulse()

const openVModel = computed({
  get: () => open.value,
  set: (v) => (open.value = v),
})

const liveText = computed(() =>
  lastBeatAt.value
    ? `${t('ServerWakeModal.live')} • ${Math.max(0, Math.round((Date.now() - lastBeatAt.value.getTime()) / 1000))}s`
    : t('ServerWakeModal.live'),
)
const errorMsg = computed(() => lastError.value?.message ?? '')

const STATUS_COLORS = {
  down: { hr: '#ef4444', chip: 'red-darken-1', title: 'red', dot: '#ef4444' },
  up: { hr: '#22c55e', chip: 'green-accent-4', title: 'green', dot: '#22c55e' },
  idle: {
    hr: '#f59e0b',
    chip: 'amber-accent-3',
    title: 'amber',
    dot: '#f59e0b',
  },
  checking: {
    hr: '#f59e0b',
    chip: 'amber-accent-3',
    title: 'amber',
    dot: '#f59e0b',
  },
} as const

const TITLE_TEXT = {
  idle: t('ServerWakeModal.titleText.idle'),
  checking: t('ServerWakeModal.titleText.checking'),
  up: t('ServerWakeModal.titleText.up'),
  down: t('ServerWakeModal.titleText.down'),
} as const

const hrColor = computed(() => STATUS_COLORS[status.value].hr)
const chipColor = computed(() => STATUS_COLORS[status.value].chip)
const dotColor = computed(() => STATUS_COLORS[status.value].dot)
const titleText = computed(() => TITLE_TEXT[status.value])

const ibiMs = computed(() => Math.round(60_000 / Math.max(40, bpm.value || 60)))

const dotRef = ref<HTMLElement | null>(null)
const isPulsing = ref(false)
// const dotShadow = computed(() => {
//   const base = status.value === 'up' ? 10 : status.value === 'checking' ? 6 : 4
//   const spread = status.value === 'up' ? 5 : 3
//   return `0 0 ${base + Math.min(10, Math.max(0, bpm.value - 60) / 3)}px ${spread}px ${dotColor.value}`
// })
watch(
  () => lastBeatAt.value?.getTime(),
  async () => {
    if (status.value !== 'up' || !dotRef.value) return
    isPulsing.value = false
    await nextTick()
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    dotRef.value.offsetWidth
    isPulsing.value = true
  },
  { flush: 'post' },
)
const waveRef = ref<HTMLCanvasElement | null>(null)
let raf = 0
let animRunning = false

function ecgKernel(tNorm: number) {
  let y = 0
  y += Math.exp(-((tNorm - 0.15) ** 2) / (2 * 0.01)) * 0.4
  y += -Math.exp(-((tNorm - 0.28) ** 2) / (2 * 0.0004)) * 1.2
  y += Math.exp(-((tNorm - 0.3) ** 2) / (2 * 0.0002)) * 3.2
  y += -Math.exp(-((tNorm - 0.33) ** 2) / (2 * 0.0006)) * 1.6
  y += Math.exp(-((tNorm - 0.6) ** 2) / (2 * 0.02)) * 0.8
  return y
}

function drawWave() {
  if (!animRunning) return
  const canvas = waveRef.value
  if (!canvas) {
    raf = requestAnimationFrame(drawWave)
    return
  }
  const dpr = window.devicePixelRatio || 1
  const w = canvas.clientWidth * dpr
  const h = canvas.clientHeight * dpr
  if (w === 0 || h === 0) {
    // dialog not sized yet; try again next frame
    raf = requestAnimationFrame(drawWave)
    return
  }
  if (canvas.width !== w) canvas.width = w
  if (canvas.height !== h) canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, w, h)

  // grid
  ctx.strokeStyle = isDark.value ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.08)'
  ctx.lineWidth = 1
  const step = 20 * dpr
  for (let x = 0; x < w; x += step) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  const mid = h * 0.55
  const amp =
    status.value === 'down' ? 0 : status.value === 'up' ? 10 * dpr : 6 * dpr
  const color = hrColor.value
  ctx.lineWidth = Math.max(2, 2 * dpr)
  ctx.strokeStyle = color
  ctx.beginPath()

  const WINDOW_MS = 4000
  const pxPerMs = w / WINDOW_MS
  const now = performance.now()

  for (let x = 0; x < w; x++) {
    const tRelMs = WINDOW_MS - x / pxPerMs
    let y = 0

    if (status.value === 'down') {
      y = 0
    } else {
      const T = 60_000 / Math.max(40, bpm.value)
      const phase = (((now - tRelMs) % T) + T) % T
      const tNorm = phase / T
      y = ecgKernel(tNorm)

      if (status.value === 'checking') {
        y += Math.sin((x + now / 8) / 32) * 0.1
      }
    }

    const yy = mid - y * amp
    x === 0 ? ctx.moveTo(0, yy) : ctx.lineTo(x, yy)
  }
  ctx.stroke()

  raf = requestAnimationFrame(drawWave)
}

async function startAnim() {
  if (animRunning) return
  await nextTick()
  animRunning = true
  raf = requestAnimationFrame(drawWave)
}

function stopAnim() {
  animRunning = false
  cancelAnimationFrame(raf)
}

watch(openVModel, (v) => {
  if (v) startAnim()
  else stopAnim()
})

onMounted(() => {
  if (openVModel.value) startAnim()
})
onBeforeUnmount(() => stopAnim())
</script>

<style scoped>
.font-mono {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
}

.pulse-dot {
  box-shadow: 0 0 4px 2px var(--dot-color);
}

.pulse-dot.pulse {
  animation: pulse-shadow var(--pulse-dur) ease-out 1;
}

@keyframes pulse-shadow {
  0% {
    transform: scale(0.9);
    box-shadow: 0 0 4px 1px var(--dot-color);
  }

  18% {
    transform: scale(1.25);
    box-shadow: 0 0 18px 7px var(--dot-color);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 6px 2px var(--dot-color);
  }
}
</style>
