<script setup lang="ts">
// -----------------------------------------------------------------------------
// Generic OAuth callback page – handles both GitHub *and* Google flows          
// -----------------------------------------------------------------------------

definePage({
  // Matches `/github-callback` or `/google-callback` (extend the regex if needed)
  path: '/:provider(github|google)-callback',
  name: 'OAuthCallback',
  meta: {
    requiresAuth: false,
    title: 'OAuth Callback',
    icon: '/icons/oauth.png',
    description: 'OAuth 2.0 callback handler',
    layout: 'DefaultLayout',
  },
})



import {
  useGithubCallbackHandler,
  useGoogleCallbackHandler,
} from '@/composables/useAuthHandler'

// ------------------------------------------------------------------------------------------------------------------
// `useRoute<'OAuthCallback'>()` gives strongly‑typed params → `provider` is "github" | "google" (thanks to typed‑router)
// ------------------------------------------------------------------------------------------------------------------
const route = useRoute<'OAuthCallback'>()

interface CallbackParams { provider: 'github' | 'google' }
const provider = computed(() => (route.params as CallbackParams).provider)


// Délégation vers le composable approprié
const { isPending, isSuccess, isError } =
  provider.value === 'github' ? useGithubCallbackHandler() : useGoogleCallbackHandler()
</script>

<template>
  <p v-if="isPending">Connexion en cours… ⏳</p>
  <p v-else-if="isError">Une erreur est survenue lors de la connexion OAuth.</p>
    <p v-else-if="isSuccess">Connexion réussie ! 🎉</p>
</template>
