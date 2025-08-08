import { nextTick, ref } from 'vue'

import { useQueryClient } from '@tanstack/vue-query'
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { useRouter } from 'vue-router'

import { useApiKeyModal } from '../components/useApiKeyModal'
import { useSession } from '../composables/useSession'
import { useMeQuery } from '../queries/useAuth'
import { useStorageStore } from '../stores/storageStore'
import { renderComposable } from '../tests/renderComposable'

vi.mock('../queries/useAuth')
vi.mock('../components/useApiKeyModal')
vi.mock('@tanstack/vue-query')
vi.mock('../stores/auth', () => ({
  useAuthStore: () => ({ isAuthenticated: true }),
}))
vi.mock('../stores/storageStore', () => {
  const setKeyInLocalStorage = vi.fn()
  const getKeyFromLocalStorage = vi
    .fn()
    .mockImplementation((_key: string, fallback = '') => ref(fallback))

  return {
    useStorageStore: vi.fn(() => ({
      setKeyInLocalStorage,
      getKeyFromLocalStorage,
      removeKeyFromLocalStorage: vi.fn(),
    })),
  }
})
const logoutSpy = vi.fn()
vi.mock('@/composables/useAuthForm', () => ({
  useAuthForm: () => ({
    logout: logoutSpy,
  }),
}))
describe('useSession composable', () => {
  let refetchSpy: ReturnType<typeof vi.fn>
  let closeModalSpy: ReturnType<typeof vi.fn>
  let removeKeySpy: ReturnType<typeof vi.fn>
  let invalidateSpy: ReturnType<typeof vi.fn>
  let router: ReturnType<typeof useRouter>

  beforeEach(() => {
    vi.resetAllMocks()

    refetchSpy = vi.fn().mockResolvedValue({ data: null, error: null })
    ;(useMeQuery as Mock).mockReturnValue({ refetch: refetchSpy })

    logoutSpy.mockImplementation((callback?: () => void) => {
      if (callback) {
        callback()
      }
      return Promise.resolve()
    })
    closeModalSpy = vi.fn()
    ;(useApiKeyModal as Mock).mockReturnValue({ closeModal: closeModalSpy })

    removeKeySpy = vi.fn()
    const getKeyMock = vi.fn().mockReturnValue(ref('tok'))
    const setKeyMock = vi.fn()

    ;(useStorageStore as unknown as Mock).mockReturnValue({
      getKeyFromLocalStorage: getKeyMock,
      setKeyInLocalStorage: setKeyMock,
      removeKeyFromLocalStorage: removeKeySpy,
    })

    invalidateSpy = vi.fn()
    ;(useQueryClient as Mock).mockReturnValue({
      invalidateQueries: invalidateSpy,
    })

    router = useRouter()
    vi.spyOn(router, 'push').mockImplementation(() => Promise.resolve())
  })

  it('initializes with no user when apiKey is empty', async () => {
    ;(useStorageStore as unknown as Mock).mockReturnValue({
      getKeyFromLocalStorage: () => ref(''),
      removeKeyFromLocalStorage: removeKeySpy,
      setKeyInLocalStorage: vi.fn(),
    })

    const [{ user, isLoggedIn, apiKey, refreshMe }] = renderComposable(() =>
      useSession(),
    )

    expect(apiKey.value).toBe('')
    expect(user.value).toBeUndefined()
    expect(isLoggedIn.value).toBe(false)
    expect(refreshMe).toBe(refetchSpy)
  })

  it('fetches user when apiKey is set and handles success', async () => {
    const fakeUser = { id: 1, name: 'Alice' }
    refetchSpy.mockResolvedValue({
      data: { user: fakeUser, quota: 42 },
      error: null,
    })

    const [{ user, isLoggedIn }] = renderComposable(() => useSession())

    await nextTick()
    await nextTick()

    expect(refetchSpy).toHaveBeenCalled()
    expect(user.value).toEqual({ ...fakeUser, quota: 42 })
    expect(isLoggedIn.value).toBe(true)
  })

  it('handles fetch error by clearing user', async () => {
    refetchSpy.mockResolvedValue({ data: undefined, error: new Error() })

    const [{ user, isLoggedIn }] = renderComposable(() => useSession())

    await nextTick()
    await nextTick()

    expect(refetchSpy).toHaveBeenCalled()
    expect(user.value).toBeUndefined()
    expect(isLoggedIn.value).toBe(false)
  })

  it('logout calls removeKey, closes modal, navigates and invalidates queries', async () => {
    const [{ logout }] = renderComposable(() => useSession())

    await nextTick()
    await nextTick()

    await logout()

    expect(logoutSpy).toHaveBeenCalled()
    expect(closeModalSpy).toHaveBeenCalled()
    expect(removeKeySpy).toHaveBeenCalledWith('apiKey')
    expect(invalidateSpy).toHaveBeenCalled()
    expect(router.push).toHaveBeenCalledWith({ name: 'SignIn' })
  })

  it('logout swallows errors from remoteLogout and still proceeds', async () => {
    logoutSpy.mockImplementationOnce(() => Promise.reject(new Error('fail')))

    const [{ logout }] = renderComposable(() => useSession())
    await nextTick()
    await nextTick()

    await logout()

    expect(closeModalSpy).toHaveBeenCalled()
    expect(removeKeySpy).toHaveBeenCalled()
    expect(invalidateSpy).toHaveBeenCalled()
    expect(router.push).toHaveBeenCalled()
  })
})
