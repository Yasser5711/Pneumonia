<template>
  <div class="server-pulse-fab">
    <v-tooltip location="top">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          :loading="status === 'checking'"
          icon
          size="large"
          elevation="12"
          rounded="pill"
          :aria-label="t('ServerPulseFab.tooltip')"
          @click="openMonitor"
        >
          <v-icon size="28">{{ btnIcon }}</v-icon>
        </v-btn>
      </template>
      <span>{{ t('ServerPulseFab.tooltip') }}</span>
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { useServerPulse } from '@/composables/useServerPulse'

const { t } = useI18n()
const { status, open } = useServerPulse()

const btnIcon = computed(() => {
  switch (status.value) {
    case 'checking':
      return 'mdi-lan-disconnect'
    case 'up':
      return 'mdi-lan-connect'
    case 'down':
      return 'mdi-lan-disconnect'
    default:
      return 'mdi-lan-disconnect'
  }
})

function openMonitor() {
  open.value = true
}
</script>

<style scoped>
.server-pulse-fab {
  position: fixed;
  left: 20px;
  bottom: 20px;
  z-index: 1000;
}
</style>
