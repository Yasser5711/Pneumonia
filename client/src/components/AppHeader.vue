<script lang="ts" setup>
import { useApiKeyModal } from '@/components/useApiKeyModal'
import { useTheme } from '@/composables/useTheme'

const { themeMode, cycleTheme } = useTheme()
const { openModal: openApiKeyModal } = useApiKeyModal()

function onLeftButtonClick() {
  openApiKeyModal()
}
</script>
<template>
  <v-app-bar
    app
    scroll-behavior="elevate"
    style="background-color: transparent; backdrop-filter: blur(10px)"
  >
    <v-btn
      icon
      class="ma-0 pa-0"
      title="API Key Settings"
      @click="onLeftButtonClick"
    >
      <span class="text-h5">🔑</span>
    </v-btn>

    <v-spacer />

    <div class="d-flex align-center justify-center">
      <ClockDisplay />
    </div>

    <v-spacer />

    <v-btn icon class="ma-0 pa-0" title="Cycle Theme" @click="cycleTheme">
      <template v-if="themeMode.mode === 'light'">
        <span class="text-h5">🌙</span>
      </template>
      <template v-else-if="themeMode.mode === 'dark'">
        <span class="text-h5">☀️</span>
      </template>
      <template v-else>
        <span class="text-h5">💻</span>
      </template>
    </v-btn>
  </v-app-bar>
</template>

<style scoped></style>
