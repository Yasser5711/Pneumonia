<script setup lang="ts">
import { useGoogleStart,useGithubStart } from '../queries/useAuth'
const { isPending: isGooglePending, mutate: googleLogin, data: googleData } = useGoogleStart()
const { isPending: isGithubPending, mutate: githubLogin, data: githubData } = useGithubStart()
watch(googleData, (data) => {
  if (data?.redirectUrl) {
    window.location.href = data.redirectUrl
  }
})
watch(githubData, (data) => {
  if (data?.redirectUrl) {
    window.location.href = data.redirectUrl
  }
})
</script>

<template>
  <v-btn :disabled="isGooglePending" @click="googleLogin">
    {{ isGooglePending ? 'Redirection…' : 'Google' }}
  </v-btn>
  <v-btn :disabled="isGithubPending" @click="githubLogin">
    {{ isGithubPending ? 'Redirection…' : 'Github' }}
  </v-btn>
</template>

