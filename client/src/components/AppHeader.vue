<script lang="ts" setup>
import { useApiKeyModal } from '@/components/useApiKeyModal'
import { useSettingsModal } from '@/components/useSettingsModal'
const { openModal: openApiKeyModal } = useApiKeyModal()
const { openModal: openSettingsModal } = useSettingsModal()
function onLeftButtonClick() {
  openApiKeyModal()
}
function onRightButtonClick() {
  openSettingsModal()
}
</script>
<template>
  <v-app-bar
    app
    scroll-behavior="hide"
    style="background-color: transparent"
    elevation="0"
  >
    <v-btn
      icon="mdi-account-key"
      class="ma-0 pa-0"
      title="API Key Settings"
      @click="onLeftButtonClick"
    />

    <v-spacer />

    <div class="d-flex align-center justify-center">
      <ClockDisplay />
    </div>

    <v-spacer />

    <v-btn
      icon="mdi-cog"
      class="ma-0 pa-0"
      title="Settings"
      @click="onRightButtonClick"
    />
  </v-app-bar>
</template>

<style scoped></style>
