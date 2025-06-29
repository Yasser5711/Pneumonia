import { useGithubCallback } from '@/queries/useAuth'

export const useGithubCallbackHandler = () => {
  const route = useRoute()
  const router = useRouter()
  const store = useStorageStore()

  const code = computed(() => route.query.code?.toString() ?? '')
  const state = computed(() => route.query.state?.toString() ?? '')

  const {
    mutate: exchangeCode,
    isPending,
    isSuccess,
    isError,
  } = useGithubCallback()

  watchEffect(() => {
    if (!code.value) return

    exchangeCode(
      { code: code.value, state: state.value },
      {
        onSuccess: ({ apiKey }) => {
          store.setKeyInLocalStorage('apiKey', apiKey)
          router.replace({ name: 'ChatPage' })
        },
        onError: () => {
          router.replace({ name: 'ChatPage', query: { error: 'oauth' } })
        },
      },
    )
  })

  return {
    isPending,
    isSuccess,
    isError,
  }
}
