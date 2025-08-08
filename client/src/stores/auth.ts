import { computed } from 'vue'

import { defineStore } from 'pinia'

import { authClient } from '../lib/auth'

export const useAuthStore = defineStore('auth', () => {
  const sessionRef = authClient.useSession()
  const isInitialized = ref(false)
  const isAuthenticated = computed(
    () => !!sessionRef.value.data?.isAuthenticated,
  )
  const userId = computed(() => sessionRef.value.data?.userId)

  async function refresh() {
    await authClient.getSession({ query: { disableCookieCache: true } })
    isInitialized.value = true
    // authClient.$store.notify('$sessionSignal') // undocumented but blessed:contentReference[oaicite:0]{index=0}
  }

  return { sessionRef, isAuthenticated, refresh, isInitialized, userId }
})
