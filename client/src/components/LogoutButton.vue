<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { useSession } from '@/composables/useSession'
const { logout } = useSession()
const { t } = useI18n()
</script>

<template>
  <v-btn
    prepend-icon="mdi-logout"
    :title="t('LogoutButton.title')"
    :text="t('LogoutButton.text')"
    color="error"
    @click="logout"
  />
</template>
