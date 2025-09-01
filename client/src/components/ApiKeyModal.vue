<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { useApiKeyModal } from './useApiKeyModal'
const { t } = useI18n()
const { isOpen } = useApiKeyModal()
useHead({
  title: () => (isOpen.value ? t('ApiKeyModal.title') : undefined),
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
