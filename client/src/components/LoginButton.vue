<script setup lang="ts">
import { useGoogleStart, useGithubStart } from '@/queries/useAuth'

import { authClient } from '../lib/auth'

const { signIn, signUp } = authClient
const email = ref('')
const password = ref('')
const firstName = ref('')
const lastName = ref('')

const isLoading = ref(false)
const errorMessage = ref('')

const handleSignIn = async (provider: 'google' | 'github' | 'email') => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    if (provider === 'email') {
      await signUp.email({
        email: email.value,
        password: password.value,
        firstName: firstName.value,
        lastName: lastName.value,
        name: `${firstName.value} ${lastName.value}`,
      })
      // Sign-in successful, the useAuth composable will update the session
      // and you can redirect or update UI elsewhere.
    } else {
      // This will handle the redirect automatically.
      const FRONTEND_URL =
        import.meta.env.VITE_FRONTEND_URL ?? // ← "http://localhost:4000" en dev
        window.location.origin
      await signIn.social({ provider, callbackURL: `${FRONTEND_URL}/chat` })
    }
  } catch (err) {
    if (err instanceof Error) {
      errorMessage.value = err.message || 'An unknown error occurred.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="d-flex align-center fill-height justify-center">
    <v-card
      class="pa-6 text-center"
      max-width="420"
      elevation="10"
      rounded="lg"
    >
      <v-card-title class="text-h5 pb-4">Sign Up or Sign In</v-card-title>

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mb-4"
        :text="errorMessage"
        dismissible
      />

      <v-text-field
        v-model="email"
        label="Email"
        type="email"
        variant="outlined"
        class="mb-3"
        :rules="[(v) => !!v || 'Email is required']"
        :disabled="isLoading"
      />
      <v-text-field
        v-model="password"
        label="Password"
        type="password"
        variant="outlined"
        class="mb-3"
        :rules="[(v) => !!v || 'Password is required']"
        :disabled="isLoading"
      />
      <v-text-field
        v-model="firstName"
        label="First Name"
        variant="outlined"
        class="mb-3"
        :rules="[(v) => !!v || 'First Name is required']"
        :disabled="isLoading"
      />
      <v-text-field
        v-model="lastName"
        label="Last Name"
        variant="outlined"
        class="mb-3"
        :rules="[(v) => !!v || 'Last Name is required']"
        :disabled="isLoading"
      />

      <v-btn
        block
        size="large"
        elevation="2"
        :loading="isLoading"
        :disabled="isLoading"
        @click="handleSignIn('email')"
      >
        Continue with Email
      </v-btn>

      <v-btn
        block
        size="large"
        elevation="2"
        :loading="isLoading"
        :disabled="isLoading"
        style="background: #4285f4; color: #fff"
        class="my-3"
        @click="handleSignIn('google')"
      >
        <template #prepend><v-icon size="22">mdi-google</v-icon></template>
        Continue with Google
      </v-btn>

      <v-btn
        block
        size="large"
        elevation="2"
        variant="outlined"
        color="black"
        :loading="isLoading"
        :disabled="isLoading"
        @click="handleSignIn('github')"
      >
        <template #prepend><v-icon size="22">mdi-github</v-icon></template>
        Continue with GitHub
      </v-btn>
    </v-card>
  </div>
</template>

<style scoped>
.fill-height {
  min-height: 100vh;
} /* mobile-safe full height */
</style>
