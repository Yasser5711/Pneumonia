<script setup lang="ts">
import { useGithubCallbackHandler } from '@/composables/useAuthHandler'
definePage({
  path: '/github-callback',
  name: 'GitHubCallback',
  meta: {
    requiresAuth: false,
    title: 'GitHub Callback',
    icon: '/icons/github.png',
    description: 'GitHub OAuth Callback',
    layout: 'DefaultLayout',
  },
})
const { isPending } = useGithubCallbackHandler()
// const qc = useQueryClient()
// onSuccess: () => {
//   qc.invalidateQueries({ queryKey: ['me'] })
//   router.replace({ name: 'IndexPage' })
// }
</script>

<template>
  <p v-if="isPending">Connexion en cours… ⏳</p>
</template>
