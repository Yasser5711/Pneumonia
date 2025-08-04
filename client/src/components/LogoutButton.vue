<script setup lang="ts">
import { useSession } from '@/composables/useSession'
const { logout } = useSession()
</script>

<template>
  <v-btn
    prepend-icon="mdi-logout"
    title="Logout"
    text="Logout"
    color="error"
    @click="logout"
  />
</template>
