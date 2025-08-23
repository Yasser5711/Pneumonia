<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { useClock } from '../composables/useClock'
const { t } = useI18n()
const { timeParts, fullDate, toggleFormat } = useClock()
</script>

<template>
  <div
    class="digital-clock font-monospace text-center"
    :title="t('ClockDisplay.title', { date: fullDate })"
    role="button"
    :aria-label="t('ClockDisplay.toggleFormat')"
    @click="toggleFormat"
  >
    <span v-for="(part, index) in timeParts" :key="index" class="time-part">
      <span v-if="part.type === 'literal'" class="colon-separator">
        {{ part.value }}
      </span>
      <span v-else>
        {{ part.value }}
      </span>
    </span>
  </div>
</template>

<style scoped>
.digital-clock {
  cursor: pointer;
  user-select: none;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease-in-out;
  font-size: 1.25rem;
}

@media (width <= 600px) {
  .digital-clock {
    font-size: 1.125rem;
  }
}

.digital-clock:hover {
  background-color: rgb(var(--v-theme-on-surface), 0.05);
}

.colon-separator {
  display: inline-block;
  padding: 0 2px;
  animation: pulse 1.5s infinite ease-in-out;
  transition: color 0.2s ease-in-out;
}

.digital-clock:hover .colon-separator {
  animation-play-state: paused;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .colon-separator {
    animation: none !important;
  }
}
</style>
