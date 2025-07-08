import { nextTick } from 'vue'

import { useQueryClient } from '@tanstack/vue-query'
import { vi, describe, it, expect, type Mock } from 'vitest'
import { useRoute, useRouter } from 'vue-router'

import {
  useGithubCallbackHandler,
  useGoogleCallbackHandler,
  useGenerateKeyHandler,
} from '@/composables/useAuthHandler'
import {
  useGithubCallback,
  useGoogleCallback,
  useGenerateKey,
} from '@/queries/useAuth'
import { useStorageStore } from '@/stores/storageStore'
import { renderComposable } from '@/tests/renderComposable'

const r = <T>(v: T) => ref(v)
vi.mock('@/queries/useAuth')
vi.mock('@tanstack/vue-query')
vi.mock('@/stores/storageStore', () => {
  const setKeyInLocalStorage = vi.fn()
  const getKeyFromLocalStorage = vi
    .fn()
    .mockImplementation((_key: string, fallback = '') => ref(fallback))

  return {
    useStorageStore: vi.fn(() => ({
      setKeyInLocalStorage,
      getKeyFromLocalStorage,
    })),
  }
})
describe('useGithubCallbackHandler', () => {
  it('calls exchangeCode and handles success', async () => {
    const mutateSpy = vi.fn((_, { onSuccess }) =>
      onSuccess({ apiKey: 'gh-key' }),
    )

    ;(useGithubCallback as Mock).mockReturnValue({
      mutate: mutateSpy,
      isPending: r(false),
      isSuccess: r(false),
      isError: r(false),
    })

    const replaceSpy = vi.fn()
    ;(useRouter as Mock).mockReturnValue({ replace: replaceSpy })
    ;(useRoute as Mock).mockReturnValue({ query: { code: 'c1', state: 's1' } })

    const { setKeyInLocalStorage: setKeySpy } = useStorageStore()

    const invalidateSpy = vi.fn()
    ;(useQueryClient as Mock).mockReturnValue({
      invalidateQueries: invalidateSpy,
    })

    const [handler] = renderComposable(() => useGithubCallbackHandler())
    const { isPending, isSuccess, isError } = handler
    expect(mutateSpy).toHaveBeenCalledWith(
      { code: 'c1', state: 's1' },
      expect.any(Object),
    )

    await nextTick()

    expect(setKeySpy).toHaveBeenCalledWith('apiKey', 'gh-key')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['me'] })
    expect(replaceSpy).toHaveBeenCalledWith({ name: 'ChatPage' })
    expect(isPending.value).toBe(false)
    expect(isSuccess.value).toBe(false)
    expect(isError.value).toBe(false)
  })

  it('handles error branch', async () => {
    const mutateSpy = vi.fn((_, { onError }) => onError())
    ;(useGithubCallback as Mock).mockReturnValue({
      mutate: mutateSpy,
      isPending: false,
      isSuccess: false,
      isError: false,
    })
    const replaceSpy = vi.fn()
    ;(useRouter as Mock).mockReturnValue({ replace: replaceSpy })
    ;(useRoute as Mock).mockReturnValue({
      query: { code: 'cx', state: 'sx' },
    })
    ;(useQueryClient as Mock).mockReturnValue({ invalidateQueries: vi.fn() })

    renderComposable(() => useGithubCallbackHandler())
    await nextTick()

    expect(replaceSpy).toHaveBeenCalledWith({
      name: 'ChatPage',
      query: { error: 'oauth' },
    })
  })
  it('ignores when no code in query', () => {
    ;(useGithubCallback as Mock).mockReturnValue({
      mutate: vi.fn(), // ne doit PAS être appelé
      isPending: r(false),
      isSuccess: r(false),
      isError: r(false),
    })
    ;(useRoute as Mock).mockReturnValue({ query: { code: '', state: '' } })

    const [handler] = renderComposable(() => useGithubCallbackHandler())

    // assertions
    expect(useGithubCallback().mutate).not.toHaveBeenCalled()
    expect(handler.isPending.value).toBe(false) // etc.
  })
})

describe('useGoogleCallbackHandler', () => {
  it('calls exchangeCode and handles success', async () => {
    const mutateSpy = vi.fn((_, { onSuccess }) =>
      onSuccess({ apiKey: 'g-key' }),
    )
    ;(useGoogleCallback as Mock).mockReturnValue({
      mutate: mutateSpy,
      isPending: r(true),
      isSuccess: r(false),
      isError: r(false),
    })
    const replaceSpy = vi.fn()
    ;(useRouter as Mock).mockReturnValue({ replace: replaceSpy })
    ;(useRoute as Mock).mockReturnValue({
      query: { code: 'gc', state: 'gs' },
    })
    const { setKeyInLocalStorage: setKeySpy } = useStorageStore()
    const invalidateSpy = vi.fn()
    ;(useQueryClient as Mock).mockReturnValue({
      invalidateQueries: invalidateSpy,
    })

    const [handler] = renderComposable(() => useGoogleCallbackHandler())
    const { isPending, isSuccess, isError } = handler
    expect(isPending.value).toBe(true)

    expect(mutateSpy).toHaveBeenCalledWith(
      { code: 'gc', state: 'gs' },
      expect.any(Object),
    )
    await nextTick()
    expect(setKeySpy).toHaveBeenCalledWith('apiKey', 'g-key')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['me'] })
    expect(replaceSpy).toHaveBeenCalledWith({ name: 'ChatPage' })
    expect(isSuccess.value).toBe(false)
    expect(isError.value).toBe(false)
  })

  it('handles error branch', async () => {
    const mutateSpy = vi.fn((_, { onError }) => onError())
    ;(useGoogleCallback as Mock).mockReturnValue({
      mutate: mutateSpy,
      isPending: false,
      isSuccess: false,
      isError: false,
    })
    const replaceSpy = vi.fn()
    ;(useRouter as Mock).mockReturnValue({ replace: replaceSpy })
    ;(useRoute as Mock).mockReturnValue({
      query: { code: 'ez', state: 'es' },
    })
    ;(useQueryClient as Mock).mockReturnValue({ invalidateQueries: vi.fn() })

    renderComposable(() => useGoogleCallbackHandler())
    await nextTick()

    expect(replaceSpy).toHaveBeenCalledWith({
      name: 'ChatPage',
      query: { error: 'oauth' },
    })
  })
  it('ignores when no code in query', () => {
    ;(useGoogleCallback as Mock).mockReturnValue({
      mutate: vi.fn(), // ne doit PAS être appelé
      isPending: r(false),
      isSuccess: r(false),
      isError: r(false),
    })
    ;(useRoute as Mock).mockReturnValue({ query: { code: '', state: '' } })

    const [handler] = renderComposable(() => useGoogleCallbackHandler())

    // assertions
    expect(useGoogleCallback().mutate).not.toHaveBeenCalled()
    expect(handler.isPending.value).toBe(false) // etc.
  })
  it('google ignore branch covers github path', () => {
    ;(useGithubCallback as Mock).mockReturnValue({
      mutate: vi.fn(),
      isPending: r(false),
      isSuccess: r(false),
      isError: r(false),
    })
    ;(useRoute as Mock).mockReturnValue({ query: { code: '', state: '' } })

    renderComposable(() => useGithubCallbackHandler())
    expect(useGithubCallback().mutate).not.toHaveBeenCalled()
  })
})

describe('useGenerateKeyHandler', () => {
  it('exposes generateKey and flags', () => {
    const genSpy = vi.fn()
    ;(useGenerateKey as Mock).mockReturnValue({
      mutate: genSpy,
      isPending: ref(false),
      isSuccess: ref(true),
      isError: ref(false),
    })

    const { generateKey, isPending, isSuccess, isError } =
      useGenerateKeyHandler()

    expect(generateKey).toBe(genSpy)
    expect(isPending.value).toBe(false)
    expect(isSuccess.value).toBe(true)
    expect(isError.value).toBe(false)
  })
})
