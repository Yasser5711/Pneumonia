<template>
  <v-app class="d-flex flex-column fill-height">
    <AppHeader />

    <v-main
      class="d-flex flex-column flex-grow-1 overflow-hidden"
      style="min-height: 0"
    >
      <slot />
      <RouterView />
    </v-main>

    <AppFooter />

    <ApiKeyModal />
  </v-app>
</template>

<script setup lang="ts">
import { useApiKeyModal } from '@/components/useApiKeyModal'
import { useStorageStore } from '@/stores/storageStore'
const modal = useApiKeyModal()
const store = useStorageStore()
if (!store.getKeyFromLocalStorage('apiKey').value) {
  modal.openModal()
}
</script>
