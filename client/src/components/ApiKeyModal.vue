<script setup lang="ts">
import { useApiKeyModal } from './useApiKeyModal'

const { isOpen } = useApiKeyModal()
</script>

<template>
  <ResponsiveModal
    v-model="isOpen"
    :desktop="{ maxWidth: 700, transition: 'scroll-y-transition' }"
  >
    <ApiKeyContent />
  </ResponsiveModal>
  <ProfileModal />
</template>
