<script setup lang="ts">
import { useCanvasAnimation } from '../composables/useCanvasAnimation'

const { canvasRef } = useCanvasAnimation()
</script>

<template>
  <canvas
    ref="canvasRef"
    class="pointer-events-none fixed inset-0 z-0 h-full w-full"
  ></canvas>
</template>
