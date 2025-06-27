<script setup lang="ts">
import { useGithubStart } from '../queries/useAuth'
const { isPending, mutate: login, data } = useGithubStart()
watch(data, (data) => {
  if (data?.redirectUrl) {
    window.location.href = data.redirectUrl
  }
})
</script>

<template>
  <v-btn :disabled="isPending" @click="login">
    {{ isPending ? 'Redirection…' : 'Se connecter avec GitHub' }}
  </v-btn>
</template>
