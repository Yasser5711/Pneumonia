import { nextTick, ref } from 'vue'

import { useQueryClient } from '@tanstack/vue-query'
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { useRouter } from 'vue-router'

import { useApiKeyModal } from '@/components/useApiKeyModal'
import { useSession } from '@/composables/useSession'
import { useMeQuery, useLogout as useLogoutMutation } from '@/queries/useAuth'
import { useStorageStore } from '@/stores/storageStore'
import { renderComposable } from '@/tests/renderComposable'

vi.mock('@/queries/useAuth')
vi.mock('@/components/useApiKeyModal')
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
describe('useSession composable', () => {
  let refetchSpy: ReturnType<typeof vi.fn>
  let mutateAsyncSpy: ReturnType<typeof vi.fn>
  let closeModalSpy: ReturnType<typeof vi.fn>
  let removeKeySpy: ReturnType<typeof vi.fn>
  let router: ReturnType<typeof useRouter>

  beforeEach(() => {
    vi.resetAllMocks()

    // mock modal
    closeModalSpy = vi.fn()
    ;(useApiKeyModal as Mock).mockReturnValue({
      closeModal: closeModalSpy,
    })

    // mock store
    removeKeySpy = vi.fn()
    const getKeyMock = vi.fn()
    ;(useStorageStore as unknown as Mock).mockReturnValue({
      getKeyFromLocalStorage: getKeyMock,
      removeKeyFromLocalStorage: removeKeySpy,
    })

    // mock queries
    refetchSpy = vi.fn().mockResolvedValue({ data: null, error: null })
    ;(useMeQuery as Mock).mockReturnValue({ refetch: refetchSpy })
    mutateAsyncSpy = vi.fn()
    ;(useLogoutMutation as Mock).mockReturnValue({
      mutateAsync: mutateAsyncSpy,
    })

    // router and queryClient stubs from setupTest.ts
    router = useRouter()
  })

  it('initializes with no user when apiKey is empty', async () => {
    ;(useStorageStore as unknown as Mock).mockReturnValue({
      getKeyFromLocalStorage: () => ref(''),
      removeKeyFromLocalStorage: removeKeySpy,
    })

    const [{ user, isLoggedIn, apiKey, refreshMe }] = renderComposable(() =>
      useSession(),
    )

    // API key should be empty
    expect(apiKey.value).toBe('')
    // no fetch called
    expect(refetchSpy).not.toHaveBeenCalled()
    expect(user.value).toBeUndefined()
    expect(isLoggedIn.value).toBe(false)
    expect(refreshMe).toBe(refetchSpy)
  })

  it('fetches user when apiKey is set and handles success', async () => {
    const fakeUser = { id: 1, name: 'Alice' }
    ;(useStorageStore as unknown as Mock).mockReturnValue({
      getKeyFromLocalStorage: () => ref('tok'),
      removeKeyFromLocalStorage: removeKeySpy,
    })
    refetchSpy.mockResolvedValue({
      data: { user: fakeUser, quota: 42 },
      error: null,
    })

    const [{ user, isLoggedIn }] = renderComposable(() => useSession())

    // wait for watchEffect and async refetch
    await nextTick()
    await nextTick()

    expect(refetchSpy).toHaveBeenCalled()
    expect(user.value).toEqual({ ...fakeUser, quota: 42 })
    expect(isLoggedIn.value).toBe(true)
  })

  it('handles fetch error by clearing user', async () => {
    ;(useStorageStore as unknown as Mock).mockReturnValue({
      getKeyFromLocalStorage: () => ref('tok'),
      removeKeyFromLocalStorage: removeKeySpy,
    })
    refetchSpy.mockResolvedValue({ data: undefined, error: new Error() })

    const [{ user, isLoggedIn }] = renderComposable(() => useSession())

    await nextTick()
    await nextTick()

    expect(refetchSpy).toHaveBeenCalled()
    expect(user.value).toBeUndefined()
    expect(isLoggedIn.value).toBe(false)
  })

  it('logout calls removeKey, closes modal, navigates and invalidates queries', async () => {
    ;(useStorageStore as unknown as Mock).mockReturnValue({
      getKeyFromLocalStorage: () => ref('tok'),
      removeKeyFromLocalStorage: removeKeySpy,
    })
    const invalidateSpy = vi.fn()
    ;(useQueryClient as Mock).mockReturnValue({
      invalidateQueries: invalidateSpy,
    })
    // simulate a user so logout always runs
    refetchSpy.mockResolvedValue({
      data: { user: { id: 5 }, quota: 1 },
      error: null,
    })
    mutateAsyncSpy.mockResolvedValue(undefined)

    const [{ logout }] = renderComposable(() => useSession())
    await nextTick()
    await nextTick()

    await logout()

    expect(mutateAsyncSpy).toHaveBeenCalled()
    expect(closeModalSpy).toHaveBeenCalled()
    expect(removeKeySpy).toHaveBeenCalledWith('apiKey')
    expect(router.push).toHaveBeenCalledWith({ name: 'IndexPage' })
    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('logout swallows errors from remoteLogout and still proceeds', async () => {
    mutateAsyncSpy.mockRejectedValue(new Error('failed'))
    ;(useStorageStore as unknown as Mock).mockReturnValue({
      getKeyFromLocalStorage: () => ref('tok'),
      removeKeyFromLocalStorage: removeKeySpy,
    })
    const invalidateSpy = vi.fn()
    ;(useQueryClient as Mock).mockReturnValue({
      invalidateQueries: invalidateSpy,
    })

    const [{ logout }] = renderComposable(() => useSession())
    await nextTick()
    await nextTick()

    await logout()
    expect(closeModalSpy).toHaveBeenCalled()
    expect(removeKeySpy).toHaveBeenCalledWith('apiKey')
    expect(router.push).toHaveBeenCalled()
    expect(invalidateSpy).toHaveBeenCalled()
  })
})
