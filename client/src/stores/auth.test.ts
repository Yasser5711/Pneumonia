import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { authClient } from '@/lib/auth'

import { useAuthStore } from './auth'

const sessionSignal: {
  data: { isAuthenticated: boolean; userId: string | null }
} = {
  data: { isAuthenticated: false, userId: null },
}

vi.mock('@/lib/auth', () => {
  const getSession = vi.fn(async () => sessionSignal)
  const useSession = vi.fn(() => ref(sessionSignal))
  return { authClient: { getSession, useSession } }
})

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionSignal.data = { isAuthenticated: false, userId: null }
  })

  it('reports unauthenticated by default', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.isInitialized).toBe(false)
  })

  it('refresh() pulls the session and flips initialised flag', async () => {
    const store = useAuthStore()

    sessionSignal.data = { isAuthenticated: true, userId: '123' }

    await store.refresh()

    expect(authClient.getSession).toHaveBeenCalledWith({
      query: { disableCookieCache: true },
    })
    expect(store.isAuthenticated).toBe(true)
    expect(store.userId).toBe('123')
    expect(store.isInitialized).toBe(true)
  })
})
