import { useI18n } from 'vue-i18n'
import { toast } from 'vuetify-sonner'

import { authClient } from '@/lib/auth'

export function useAuthForm() {
  const { t } = useI18n()
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
      const { data, error } = await authClient.signIn.email({
        email: email.value,
        password: password.value,
        callbackURL: `${FRONTEND_URL}/chat`,
        rememberMe: rememberMe.value,
      })
      if (error) throw error
      if (data) return true
    } catch (e) {
      errorMsg.value = (e as Error).message ?? t('useAuthForm.signIn.error')
      toast.error(errorMsg.value)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function signUp() {
    isLoading.value = true
    errorMsg.value = ''
    try {
      const { data, error } = await authClient.signUp.email({
        email: email.value,
        password: password.value,
        firstName: firstName.value,
        lastName: lastName.value,
        name: `${firstName.value} ${lastName.value}`,
        callbackURL: `${FRONTEND_URL}/chat`,
      })
      if (error) throw error
      if (data) return true
    } catch (e) {
      errorMsg.value = (e as Error).message ?? t('useAuthForm.signUp.error')
      toast.error(errorMsg.value)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout(callback: () => void) {
    isLoading.value = true
    errorMsg.value = ''
    try {
      const { error } = await authClient.signOut()
      if (error) throw error
      callback?.()
      return true
    } catch (e) {
      errorMsg.value = (e as Error).message ?? t('useAuthForm.logout.error')
      toast.error(errorMsg.value)
      return false
    } finally {
      isLoading.value = false
    }
  }
  async function socialSignIn(provider: 'google' | 'github') {
    isLoading.value = true
    errorMsg.value = ''
    try {
      const { data, error } = await authClient.signIn.social({
        provider,
        callbackURL: `${FRONTEND_URL}/chat`,
      })
      if (error) throw error
      if (data) return true
    } catch (e) {
      errorMsg.value =
        (e as Error).message ?? t('useAuthForm.socialSignIn.error')
      toast.error(errorMsg.value)
      return false
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
