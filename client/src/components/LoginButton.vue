<!-- src/components/LoginButton.vue -->
<script setup lang="ts">
import { useGitHubLogin } from '../composables/useGitHubLogin'
const { mutate: login, isPending } = useGitHubLogin()
</script>

<template>
  <v-btn :disabled="isPending" @click="login">
    {{ isPending ? 'Redirection…' : 'Se connecter avec GitHub' }}
  </v-btn>
</template>
