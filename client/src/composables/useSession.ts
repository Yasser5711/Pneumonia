import { useQueryClient } from '@tanstack/vue-query'

import { useLogout as useLogoutMutation, useMeQuery } from '@/queries/useAuth'
import type { User } from '@/types/app'

import { useApiKeyModal } from '../components/useApiKeyModal'
export function useSession() {
  const user = ref<User>(undefined)
  const store = useStorageStore()
  const apiKeyRef = store.getKeyFromLocalStorage('apiKey', '')
  const router = useRouter()
  const qc = useQueryClient()
  const { closeModal } = useApiKeyModal()
  const { refetch } = useMeQuery({ enabled: !!apiKeyRef.value })

  watchEffect(async () => {
    if (!apiKeyRef.value) {
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
    }
  })

  const { mutateAsync: remoteLogout } = useLogoutMutation()

  async function logout() {
    try {
      await remoteLogout()
    } catch {
      /* API down? on s’en fiche, on wipe local */
    }
    store.removeKeyFromLocalStorage('apiKey')
    user.value = undefined
    await qc.invalidateQueries()
    closeModal()
    await router.push({ name: 'IndexPage' })
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
