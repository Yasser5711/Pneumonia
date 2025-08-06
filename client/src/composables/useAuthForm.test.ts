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
  })

  describe('signIn', () => {
    it('calls authClient.signIn.email correctly', async () => {
      const [form] = renderComposable(() => useAuthForm())
      form.email.value = 'test@example.com'
      form.password.value = 'password123'

      await form.signIn()

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
      vi.mocked(authClient.signIn.email).mockRejectedValueOnce(
        new Error('fail'),
      )

      const [form] = renderComposable(() => useAuthForm())
      form.email.value = 'test@example.com'
      form.password.value = 'wrong'

      await expect(form.signIn()).rejects.toThrow('fail')
      expect(form.errorMsg.value).toBe('fail')
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

      await form.signUp()

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
      vi.mocked(authClient.signUp.email).mockRejectedValueOnce(
        new Error('signup failed'),
      )

      const [form] = renderComposable(() => useAuthForm())
      form.email.value = 'a@b.com'
      form.password.value = '123'
      form.firstName.value = 'A'
      form.lastName.value = 'B'

      await expect(form.signUp()).rejects.toThrow('signup failed')
      expect(form.errorMsg.value).toBe('signup failed')
      expect(form.isLoading.value).toBe(false)
    })
  })

  describe('logout', () => {
    it('calls authClient.signOut and invokes callback', async () => {
      const callback = vi.fn()
      const [form] = renderComposable(() => useAuthForm())

      await form.logout(callback)

      expect(authClient.signOut).toHaveBeenCalled()
      expect(callback).toHaveBeenCalled()
      expect(form.isLoading.value).toBe(false)
      expect(form.errorMsg.value).toBe('')
    })

    it('sets errorMsg on logout failure', async () => {
      vi.mocked(authClient.signOut).mockRejectedValueOnce(
        new Error('logout failed'),
      )

      const [form] = renderComposable(() => useAuthForm())

      await expect(form.logout(() => {})).rejects.toThrow('logout failed')
      expect(form.errorMsg.value).toBe('logout failed')
      expect(form.isLoading.value).toBe(false)
    })
  })

  describe('socialSignIn', () => {
    it('calls authClient.signIn.social with correct provider', async () => {
      const [form] = renderComposable(() => useAuthForm())

      await form.socialSignIn('github')

      expect(authClient.signIn.social).toHaveBeenCalledWith({
        provider: 'github',
        callbackURL: expect.stringMatching(/\/chat$/),
      })
      expect(form.isLoading.value).toBe(false)
      expect(form.errorMsg.value).toBe('')
    })
  })
})
