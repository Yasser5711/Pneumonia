import { authClient } from '@/lib/auth'

export function useAuthForm() {
  const email = ref('')
  const password = ref('')
  const firstName = ref('')
  const lastName = ref('')
  const isLoading = ref(false)
  const errorMsg = ref('')
  const rememberMe = ref(false)
  const FRONTEND_URL =
    import.meta.env.VITE_FRONTEND_URL ?? window.location.origin
  async function signIn() {
    isLoading.value = true
    errorMsg.value = ''
    try {
      await authClient.signIn.email({
        email: email.value,
        password: password.value,
        callbackURL: `${FRONTEND_URL}/chat`,
        rememberMe: rememberMe.value,
      })
    } catch (e) {
      errorMsg.value = (e as Error).message ?? 'Unknown error'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function signUp() {
    isLoading.value = true
    errorMsg.value = ''
    try {
      await authClient.signUp.email({
        email: email.value,
        password: password.value,
        firstName: firstName.value,
        lastName: lastName.value,
        name: `${firstName.value} ${lastName.value}`,
        callbackURL: `${FRONTEND_URL}/chat`,
      })
    } catch (e) {
      errorMsg.value = (e as Error).message ?? 'Unknown error'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function logout(callback: () => void) {
    isLoading.value = true
    errorMsg.value = ''
    try {
      await authClient.signOut()
      callback?.()
    } catch (e) {
      errorMsg.value = (e as Error).message ?? 'Unknown error'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  async function socialSignIn(provider: 'google' | 'github') {
    isLoading.value = true
    errorMsg.value = ''
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: `${FRONTEND_URL}/chat`,
      })
    } catch (e) {
      errorMsg.value = (e as Error).message ?? 'Unknown error'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    email,
    password,
    firstName,
    lastName,
    rememberMe,

    isLoading,
    errorMsg,

    signIn,
    signUp,
    logout,
    socialSignIn,
  }
}
