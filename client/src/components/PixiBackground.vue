<script setup lang="ts">
import { usePixiBackground } from '@/composables/usePixiBackground'

const { elRef, paneHost } = usePixiBackground()
</script>

<template>
  <div ref="elRef" class="z--1 pointer-events-none fixed inset-0 dark:invert" />
  <div
    ref="paneHost"
    class="pointer-events-auto fixed right-4 bottom-4 z-[9999]"
  />
</template>
