<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { authClient } from '../lib/auth'

const { t } = useI18n()
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
    } else {
      const FRONTEND_URL =
        import.meta.env.VITE_FRONTEND_URL ?? window.location.origin
      await signIn.social({ provider, callbackURL: `${FRONTEND_URL}/chat` })
    }
  } catch (err) {
    if (err instanceof Error) {
      errorMessage.value = err.message || t('LoginButton.error')
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
      <v-card-title class="text-h5 pb-4">{{
        t('LoginButton.title')
      }}</v-card-title>

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
        :label="t('LoginButton.email')"
        type="email"
        variant="outlined"
        class="mb-3"
        :rules="[(v) => !!v || t('LoginButton.emailRequired')]"
        :disabled="isLoading"
      />
      <v-text-field
        v-model="password"
        :label="t('LoginButton.password')"
        type="password"
        variant="outlined"
        class="mb-3"
        :rules="[(v) => !!v || t('LoginButton.passwordRequired')]"
        :disabled="isLoading"
      />
      <v-text-field
        v-model="firstName"
        :label="t('LoginButton.firstName')"
        variant="outlined"
        class="mb-3"
        :rules="[(v) => !!v || t('LoginButton.firstNameRequired')]"
        :disabled="isLoading"
      />
      <v-text-field
        v-model="lastName"
        :label="t('LoginButton.lastName')"
        variant="outlined"
        class="mb-3"
        :rules="[(v) => !!v || t('LoginButton.lastNameRequired')]"
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
        {{ t('LoginButton.google') }}
      </v-btn>

      <v-btn
        block
        size="large"
        elevation="2"
        color="black"
        :loading="isLoading"
        :disabled="isLoading"
        @click="handleSignIn('github')"
      >
        <template #prepend><v-icon size="22">mdi-github</v-icon></template>
        {{ t('LoginButton.github') }}
      </v-btn>
    </v-card>
  </div>
</template>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
