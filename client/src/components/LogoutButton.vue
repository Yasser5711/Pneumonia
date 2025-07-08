<script setup lang="ts">
import { useSession } from '@/composables/useSession'
const { logout } = useSession()
</script>

<template>
  <v-btn icon title="Log out" @click="logout">
    <v-icon icon="mdi-logout" />
  </v-btn>
</template>
