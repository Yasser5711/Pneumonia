<template>
  <v-app>
    <router-view />
    <ApiKeyModal />
  </v-app>
</template>

<script lang="ts" setup>
import { useApiKeyModal } from '@/components/useApiKeyModal'
import { useStorageStore } from '@/stores/storageStore'
const modal = useApiKeyModal()
const store = useStorageStore()
if (!store.getKeyFromLocalStorage('apiKey').value) {
  modal.openModal()
}
</script>
