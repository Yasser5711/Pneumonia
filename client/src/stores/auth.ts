// src/stores/auth.ts  (Pinia)
import { computed } from 'vue'

import { defineStore } from 'pinia'

import { authClient } from '../lib/auth'

export const useAuthStore = defineStore('auth', () => {
  const sessionRef = authClient.useSession()
  const isAuthenticated = computed(
    () => !!sessionRef.value.data?.isAuthenticated,
  )

  async function refresh() {
    await authClient.getSession({ query: { disableCookieCache: true } })

    authClient.$store.notify('$sessionSignal') // undocumented but blessed:contentReference[oaicite:0]{index=0}
  }

  return { sessionRef, isAuthenticated, refresh }
})
