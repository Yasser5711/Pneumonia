import { useQueryClient } from '@tanstack/vue-query'

import {
  useGithubCallback,
  useGoogleCallback,
  useGenerateKey,
} from '@/queries/useAuth'
export const useGithubCallbackHandler = () => {
  const route = useRoute()
  const router = useRouter()
  const store = useStorageStore()
  const qc = useQueryClient()
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
          qc.invalidateQueries({ queryKey: ['me'] })
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
export const useGoogleCallbackHandler = () => {
  const route = useRoute()
  const router = useRouter()
  const store = useStorageStore()
  const qc = useQueryClient()
  const code = computed(() => route.query.code?.toString() ?? '')
  const state = computed(() => route.query.state?.toString() ?? '')

  const {
    mutate: exchangeCode,
    isPending,
    isSuccess,
    isError,
  } = useGoogleCallback()

  watchEffect(() => {
    if (!code.value) return

    exchangeCode(
      { code: code.value, state: state.value },
      {
        onSuccess: ({ apiKey }) => {
          store.setKeyInLocalStorage('apiKey', apiKey)
          qc.invalidateQueries({ queryKey: ['me'] })
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

export const useGenerateKeyHandler = () => {
  const {
    mutate: generateKey,
    isPending,
    isSuccess,
    isError,
  } = useGenerateKey()

  return {
    generateKey,
    isPending,
    isSuccess,
    isError,
  }
}
