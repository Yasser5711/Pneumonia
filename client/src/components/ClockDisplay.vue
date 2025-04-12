<script setup lang="ts">
import { useClock } from '../composables/useClock'

const { timeParts, fullDate, toggleFormat } = useClock()
</script>

<template>
  <div
    class="group cursor-pointer select-none text-center font-mono text-base md:text-lg"
    :title="fullDate"
    @click="toggleFormat"
  >
    <span
      v-for="part in timeParts"
      :key="part.type"
    >
      <span
        v-if="part.type === 'literal' && part.value === ':'"
        class="inline-block animate-pulse px-0.5 group-hover:text-primary"
      >
        {{ part.value }}
      </span>
      <span v-else>
        {{ part.value }}
      </span>
    </span>
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none !important;
  }
}
</style>
