<script setup lang="ts">
import {
  useGithubCallbackHandler,
  useGoogleCallbackHandler,
} from '@/composables/useAuthHandler'
definePage({
  path: '/:provider(github|google)-callback',
  name: 'OAuthCallback',
  meta: {
    guestOnly: true,
    title: 'OAuth Callback',
    icon: '/icons/oauth.png',
    description: 'OAuth 2.0 callback handler',
    layout: 'DefaultLayout',
  },
})

const route = useRoute<'OAuthCallback'>()

interface CallbackParams {
  provider: 'github' | 'google'
}
const provider = computed(() => (route.params as CallbackParams).provider)
const { isPending, isSuccess, isError } =
  provider.value === 'github'
    ? useGithubCallbackHandler()
    : useGoogleCallbackHandler()
useHead({
  title: () =>
    isPending.value ? 'Connexion en cours...' : 'Connexion réussie',
  meta: [
    {
      name: 'description',
      content: isPending.value
        ? 'Connexion en cours via OAuth 2.0...'
        : isSuccess.value
          ? 'Connexion réussie !'
          : 'Une erreur est survenue lors de la connexion OAuth.',
    },
  ],
})
</script>

<template>
  <p v-if="isPending">Connexion en cours… ⏳</p>
  <p v-else-if="isError">Une erreur est survenue lors de la connexion OAuth.</p>
  <p v-else-if="isSuccess">Connexion réussie ! 🎉</p>
</template>
