<template>
  <v-app class="d-flex flex-column fill-height">
    <slot name="header" />

    <PixiBackground />
    <!-- header facultatif -->
    <v-main
      class="d-flex flex-column flex-grow-1 overflow-hidden"
      style="min-height: 0"
    >
      <RouterView />
    </v-main>
    <slot name="footer" />
    <!-- footer facultatif -->
    <ApiKeyModal />
    <SettingsModal />
  </v-app>
</template>

<script setup lang="ts">
import type { VNode } from 'vue'

defineSlots<{
  header?: () => VNode | VNode[]
  footer?: () => VNode | VNode[]
}>()
</script>
