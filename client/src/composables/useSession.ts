import { useQueryClient } from '@tanstack/vue-query'

import { useLogout as useLogoutMutation, useMeQuery } from '@/queries/useAuth'
const user =
  ref<Awaited<ReturnType<typeof useMeQuery>['data']['value']>>(undefined)
export function useSession() {
  const store = useStorageStore()
  const apiKeyRef = store.getKeyFromLocalStorage('apiKey', '')

  const qc = useQueryClient()

  // const { data, refetch, isFetching } = useMeQuery({
  //   enabled: false,
  //   onSuccess: (d) => {
  //     user.value = d
  //     console.log('ME query success', d) // <-- doit être 200 + payload
  //   },
  //   onError: () => (user.value = undefined),
  // })
  // // watch(
  // //   apiKeyRef,
  // //   (val) => {
  // //     if (val) refetch()
  // //     else user.value = undefined
  // //   },
  // //   { immediate: true },
  // // )
  // watchEffect(async () => {
  //   if (apiKeyRef.value) {
  //     await refetch()
  //     // console.log('ME query result', res) // <-- doit être 200 + payload
  //   }
  // })
  // async function refreshMe() {
  //   await refetch()
  // }
  const { refetch } = useMeQuery({ enabled: false })

  watchEffect(async () => {
    if (!apiKeyRef.value) {
      user.value = undefined // reset propre
      return
    }

    // 1. On fetch.
    const { data: me, error } = await refetch()

    // 2. On décide nous-mêmes quoi faire.
    if (error) {
      console.warn('ME query error → logout soft', error)
      user.value = undefined
    } else if (me) {
      user.value = me // ✅ mise à jour
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
    await qc.invalidateQueries() // flush cache
  }
  const isLoggedIn = computed(() => !!user.value)
  watch(
    [isLoggedIn, user],
    ([loggedIn, user]) => {
      console.log('isLoggedIn changed:', loggedIn)
      console.log('user changed:', user)
    },
    { immediate: true },
  )
  // return { data, user, isFetching, refreshMe, logout, isLoggedIn }
  return {
    user,
    isLoggedIn,
    refreshMe: refetch,
    logout,
    apiKey: apiKeyRef,
  }
}
