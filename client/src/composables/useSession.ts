import { useQueryClient } from '@tanstack/vue-query'

import { useMeQuery } from '@/queries/useAuth'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/app'

import { useApiKeyModal } from '../components/useApiKeyModal'

import { useAuthForm } from './useAuthForm'

const user = ref<User>(undefined)

export function useSession() {
  const store = useStorageStore()
  const { isAuthenticated } = useAuthStore()
  const apiKeyRef = store.getKeyFromLocalStorage('apiKey', '')
  const router = useRouter()
  const qc = useQueryClient()
  const { closeModal } = useApiKeyModal()
  const { refetch } = useMeQuery({ enabled: false })
  const { logout: authLogout } = useAuthForm()
  watchEffect(async () => {
    if (!isAuthenticated) {
      user.value = undefined
      return
    }
    const { data: me, error } = await refetch()

    if (error) {
      console.warn('ME query error → logout soft', error)
      user.value = undefined
    } else if (me) {
      user.value = me.user
      if (user.value) {
        user.value.quota = me.quota
      }
      if (user.value?.apiKey) {
        store.setKeyInLocalStorage('apiKey', user.value.apiKey)
      }
    }
  })
  function wipeLocalStorage() {
    closeModal()
    store.removeKeyFromLocalStorage('apiKey')
    user.value = undefined
    qc.invalidateQueries()
  }
  async function logout() {
    try {
      await authLogout(wipeLocalStorage)
    } catch {
      wipeLocalStorage()
    } finally {
      router.push({ name: 'SignIn' })
    }
  }
  const isLoggedIn = computed(() => !!user.value)

  return {
    user,
    isLoggedIn,
    refreshMe: refetch,
    logout,
    apiKey: apiKeyRef,
  }
}
