<script setup lang="ts">
import { useApiKeyModal } from './useApiKeyModal'

const { isOpen } = useApiKeyModal()
useHead({
  title: () => (isOpen.value ? 'Mon API Key' : undefined),
})
</script>

<template>
  <ResponsiveModal
    v-model="isOpen"
    :desktop="{ maxWidth: 700, transition: 'scroll-y-transition' }"
    :mobile="{ closable: true }"
  >
    <ApiKeyContent />
  </ResponsiveModal>
  <ProfileModal />
</template>
