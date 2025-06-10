<script setup lang="ts">
import { useCanvasAnimation } from '../composables/useCanvasAnimation'

const { canvasRef } = useCanvasAnimation()
</script>

<template>
  <canvas
    ref="canvasRef"
    class="position-fixed fill-height fill-width z-index-0 pe-none start-0 end-0 top-0 bottom-0"
  />
</template>
