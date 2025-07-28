import { authClient } from '@/lib/auth'

export function useAuthForm() {
  const email = ref('')
  const password = ref('')
  const firstName = ref('')
  const lastName = ref('')
  const isLoading = ref(false)
  const errorMsg = ref('')
  const router = useRouter()
  async function signIn() {
    isLoading.value = true
    errorMsg.value = ''
    try {
      await authClient.signIn.email({
        email: email.value,
        password: password.value,
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
      })
    } catch (e) {
      errorMsg.value = (e as Error).message ?? 'Unknown error'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    errorMsg.value = ''
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push({ name: 'SignIn' })
          },
        },
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

    isLoading,
    errorMsg,

    signIn,
    signUp,
    logout,
  }
}
