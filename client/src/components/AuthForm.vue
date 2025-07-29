<script setup lang="ts">
import { useAuthForm } from '../composables/useAuthForm'

const props = defineProps<{
  mode: 'signin' | 'signup'
  initialEmail?: string
}>()

const emit = defineEmits<{ submitted: [] }>()

const {
  email,
  password,
  firstName,
  lastName,
  isLoading,
  errorMsg,
  signIn,
  signUp,
  socialSignIn,
} = useAuthForm()

if (props.initialEmail) email.value = props.initialEmail

const handle = async () => {
  try {
    props.mode === 'signup' ? await signUp() : await signIn()
    emit('submitted')
  } catch {
    /* auth.errorMsg */
  }
}

const showName = computed(() => props.mode === 'signup')
</script>

<template>
  <v-card
    class="pa-6 text-center"
    max-width="640"
    width="100%"
    elevation="10"
    rounded="lg"
  >
    <v-card-title class="text-h5 pb-4">
      {{ props.mode === 'signup' ? 'SignUp' : 'SignIn' }}
    </v-card-title>

    <v-alert
      v-if="errorMsg"
      type="error"
      variant="tonal"
      class="mb-4"
      :text="errorMsg"
      dismissible
    />

    <v-text-field
      v-model="email"
      label="Email"
      type="email"
      variant="outlined"
      :rules="[(v) => !!v || 'Email is required']"
      :disabled="isLoading"
    />
    <v-text-field
      v-model="password"
      label="Password"
      type="password"
      variant="outlined"
      :rules="[(v) => !!v || 'Password is required']"
      :disabled="isLoading"
    />
    <!-- SignUp -->
    <template v-if="showName">
      <v-text-field
        v-model="firstName"
        label="First Name"
        variant="outlined"
        :rules="[(v) => !!v || 'First Name is required']"
        :disabled="isLoading"
      />
      <v-text-field
        v-model="lastName"
        label="Last Name"
        variant="outlined"
        :rules="[(v) => !!v || 'Last Name is required']"
        :disabled="isLoading"
      />
    </template>

    <v-btn
      block
      size="large"
      elevation="2"
      :loading="isLoading"
      :disabled="isLoading"
      @click="handle"
    >
      {{ props.mode === 'signup' ? 'Create account' : 'Continue' }}
    </v-btn>
    <v-btn
      block
      size="large"
      :loading="isLoading"
      :disabled="isLoading"
      class="my-3"
      @click="socialSignIn('google')"
    >
      <template #prepend><v-icon size="22">mdi-google</v-icon></template>
      Continue with Google
    </v-btn>
    <v-btn
      block
      size="large"
      :loading="isLoading"
      :disabled="isLoading"
      @click="socialSignIn('github')"
    >
      <template #prepend><v-icon size="22">mdi-github</v-icon></template>
      Continue with GitHub
    </v-btn>
  </v-card>
</template>
