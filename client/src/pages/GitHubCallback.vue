<!-- src/pages/GitHubCallback.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGithubCallback } from '../queries/useAuth'
definePage({
  path: '/github-callback',
  name: 'GitHubCallback',
  meta: {
    requiresAuth: true,
    title: 'GitHub Callback',
    icon: '/icons/github.png',
    description: 'GitHub OAuth Callback',
    layout: 'DefaultLayout',
  },
})
const route = useRoute()
const router = useRouter()
const { mutate: exchangeCode, isPending } = useGithubCallback()

onMounted(() => {
  const code = String(route.query.code ?? '')
  const state = String(route.query.state ?? '')
  if (!code) return router.replace({ name: 'ChatPage' })

  exchangeCode(
    { code, state },
    {
      onSuccess: () => router.replace({ name: '/IndexPage' }),
      onError: () =>
        router.replace({ name: 'ChatPage', query: { error: 'oauth' } }),
    },
  )
})
// const qc = useQueryClient()
// onSuccess: () => {
//   qc.invalidateQueries({ queryKey: ['me'] })
//   router.replace({ name: 'IndexPage' })
// }
</script>

<template>
  <p v-if="isPending">Connexion en cours… ⏳</p>
</template>
