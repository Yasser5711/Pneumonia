<script setup lang="ts">
import { usePixiBackground } from '@/composables/usePixiBackground'

const { elRef, mode, triggerExplosion } = usePixiBackground()

function toggleMode() {
  const modes = ['idle', 'repel', 'gravity'] as const
  const current = modes.indexOf(mode.value)
  mode.value = modes[(current + 1) % modes.length]
}
</script>

<template>
  <div ref="elRef" class="z--1 pointer-events-none fixed inset-0 dark:invert" />

  <div class="absolute top-4 right-4 z-10 flex gap-2">
    <button class="rounded bg-gray-800 p-2 text-white" @click="toggleMode">
      Mode: {{ mode }}
    </button>
    <button
      class="rounded bg-red-500 p-2 text-white"
      @click="() => triggerExplosion()"
    >
      💥 Explode
    </button>
  </div>
</template>
