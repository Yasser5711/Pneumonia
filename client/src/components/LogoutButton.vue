<script setup lang="ts">
import { useAuthForm } from '../composables/useAuthForm'
const { logout } = useAuthForm()
</script>

<template>
  <v-btn icon title="Log out" @click="logout">
    <v-icon icon="mdi-logout" />
  </v-btn>
</template>
