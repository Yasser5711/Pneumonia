import { vi, describe, it, expect, beforeEach } from 'vitest'

import { useAuthForm } from '@/composables/useAuthForm'
import { authClient } from '@/lib/auth'

import { renderComposable } from '../tests/renderComposable'

vi.mock('@/lib/auth', () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
      social: vi.fn(),
    },
    signUp: {
      email: vi.fn(),
    },
    signOut: vi.fn(),
  },
}))

describe('useAuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authClient.signIn.email).mockResolvedValue({
      data: {},
      error: null,
    })
    vi.mocked(authClient.signIn.social).mockResolvedValue({
      data: {},
      error: null,
    })
    vi.mocked(authClient.signUp.email).mockResolvedValue({
      data: {},
      error: null,
    })
    vi.mocked(authClient.signOut).mockResolvedValue({ error: null })
  })

  describe('signIn', () => {
    it('calls authClient.signIn.email correctly', async () => {
      const [form] = renderComposable(() => useAuthForm())
      form.email.value = 'test@example.com'
      form.password.value = 'password123'

      const ok = await form.signIn()
      expect(ok).toBe(true)
      expect(authClient.signIn.email).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        callbackURL: expect.stringMatching(/\/chat$/),
        rememberMe: false,
      })
      expect(form.isLoading.value).toBe(false)
      expect(form.errorMsg.value).toBe('')
    })

    it('sets errorMsg on signIn failure', async () => {
      vi.mocked(authClient.signIn.email).mockResolvedValueOnce({
        data: null,
        error: new Error('oops'),
      })

      const [form] = renderComposable(() => useAuthForm())
      form.email.value = 'test@example.com'
      form.password.value = 'wrong'
      const ok = await form.signIn()
      expect(ok).toBe(false)
      expect(form.errorMsg.value).toBe('oops')
      expect(form.isLoading.value).toBe(false)
    })
  })

  describe('signUp', () => {
    it('calls authClient.signUp.email correctly', async () => {
      const [form] = renderComposable(() => useAuthForm())
      form.email.value = 'new@example.com'
      form.password.value = 'secure'
      form.firstName.value = 'John'
      form.lastName.value = 'Doe'

      const ok = await form.signUp()
      expect(ok).toBe(true)
      expect(authClient.signUp.email).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'secure',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        callbackURL: expect.stringMatching(/\/chat$/),
      })
      expect(form.errorMsg.value).toBe('')
      expect(form.isLoading.value).toBe(false)
    })

    it('sets errorMsg on signUp failure', async () => {
      vi.mocked(authClient.signUp.email).mockResolvedValueOnce({
        data: null,
        error: new Error('signup failed'),
      })

      const [form] = renderComposable(() => useAuthForm())
      form.email.value = 'a@b.com'
      form.password.value = '123'
      form.firstName.value = 'A'
      form.lastName.value = 'B'

      const ok = await form.signUp()
      expect(ok).toBe(false)
      expect(form.errorMsg.value).toBe('signup failed')
      expect(form.isLoading.value).toBe(false)
    })
  })

  describe('logout', () => {
    it('calls authClient.signOut and invokes callback', async () => {
      const callback = vi.fn()
      const [form] = renderComposable(() => useAuthForm())

      const ok = await form.logout(callback)
      expect(ok).toBe(true)
      expect(authClient.signOut).toHaveBeenCalled()
      expect(callback).toHaveBeenCalled()
      expect(form.isLoading.value).toBe(false)
      expect(form.errorMsg.value).toBe('')
    })

    it('sets errorMsg on logout failure', async () => {
      vi.mocked(authClient.signOut).mockResolvedValueOnce({
        error: new Error('logout failed'),
      })

      const [form] = renderComposable(() => useAuthForm())

      const ok = await form.logout(() => {})
      expect(ok).toBe(false)
      expect(form.errorMsg.value).toBe('logout failed')
      expect(form.isLoading.value).toBe(false)
    })
  })

  describe('socialSignIn', () => {
    it('calls authClient.signIn.social with correct provider', async () => {
      const [form] = renderComposable(() => useAuthForm())

      const ok = await form.socialSignIn('github')
      expect(ok).toBe(true)
      expect(authClient.signIn.social).toHaveBeenCalledWith({
        provider: 'github',
        callbackURL: expect.stringMatching(/\/chat$/),
      })
      expect(form.isLoading.value).toBe(false)
      expect(form.errorMsg.value).toBe('')
    })
    it('sets errorMsg on socialSignIn failure', async () => {
      vi.mocked(authClient.signIn.social).mockResolvedValueOnce({
        data: null,
        error: new Error('social login failed'),
      })

      const [form] = renderComposable(() => useAuthForm())

      const ok = await form.socialSignIn('github')
      expect(ok).toBe(false)
      expect(form.errorMsg.value).toBe('social login failed')
      expect(form.isLoading.value).toBe(false)
    })
  })
})
