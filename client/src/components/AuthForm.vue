<script setup lang="ts">
import { useAuthForm } from '../composables/useAuthForm'

import type { VForm } from 'vuetify/components'
const props = defineProps<{
  mode: 'signin' | 'signup'
  initialEmail?: string
}>()

const emit = defineEmits<{ submitted: []; toggleMode: [] }>()
defineSlots<{
  default: []
}>()
const {
  email,
  password,
  firstName,
  lastName,
  rememberMe,
  isLoading,
  errorMsg,
  signIn,
  signUp,
  socialSignIn,
} = useAuthForm()

if (props.initialEmail) email.value = props.initialEmail

const showName = computed(() => props.mode === 'signup')
const visible = ref(false)

const formRef = ref<VForm | null>(null)
const confirmPassword = ref('')
const required = (label: string) => (v: unknown) =>
  !!v || `${label} is required`
const emailRule = (v: string) => /.+@.+\..+/.test(v) || 'Invalid e-mail address'
const pwdRule = (v: string) => (v?.length ?? 0) >= 8 || '≥ 8 characters please'
const confirmRule = (v: string) =>
  v === password.value || 'Passwords do not match'
const handle = async () => {
  const { valid } = await formRef.value!.validate()
  if (!valid) return

  try {
    props.mode === 'signup' ? await signUp() : await signIn()
    emit('submitted')
  } catch {
    throw new Error('Authentication failed')
  }
}

watch(
  () => props.mode,
  () => {
    formRef.value?.resetValidation()
    confirmPassword.value = ''
  },
)
</script>

<template>
  <v-card class="pa-6" max-width="640" width="100%" elevation="10" rounded="lg">
    <v-alert
      v-if="errorMsg"
      type="error"
      variant="tonal"
      class="mb-4"
      :text="errorMsg"
      dismissible
    />

    <v-form ref="formRef" :disabled="isLoading" @submit.prevent="handle">
      <v-text-field
        v-model="email"
        label="Email"
        type="email"
        :rules="[required('Email'), emailRule]"
      />
      <v-text-field
        v-model="password"
        :type="visible ? 'text' : 'password'"
        :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
        label="Password"
        :rules="[required('Password'), pwdRule]"
        @click:append-inner="visible = !visible"
      />

      <v-text-field
        v-if="showName"
        v-model="confirmPassword"
        :type="visible ? 'text' : 'password'"
        :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
        label="Confirm password"
        :rules="[required('Confirm password'), confirmRule]"
        @click:append-inner="visible = !visible"
      />

      <!-- Extra fields only on SignUp -->
      <template v-if="showName">
        <v-text-field
          v-model="firstName"
          label="First name"
          :rules="[required('First name')]"
        />
        <v-text-field
          v-model="lastName"
          label="Last name"
          :rules="[required('Last name')]"
        />
      </template>

      <v-btn class="mt-4" type="submit" block size="large" :loading="isLoading">
        {{ props.mode === 'signup' ? 'Create account' : 'Continue' }}
      </v-btn>
    </v-form>

    <div
      v-if="props.mode === 'signin'"
      class="d-flex justify-space-between align-center mt-2"
    >
      <v-checkbox
        v-model="rememberMe"
        label="Remember me"
        density="compact"
        hide-details
        class="ma-0 pa-0"
        style="width: auto"
      />
      <v-btn variant="text" class="text-primary text-none" slim>
        Forgot password?
      </v-btn>
    </div>

    <div class="my-8">
      <v-divider>
        <template #default>
          <div class="text-caption text-grey">Or continue with</div>
        </template>
      </v-divider>
    </div>

    <div class="d-flex align-center ga-4 mb-8 justify-center">
      <v-btn
        icon
        variant="tonal"
        color="red darken-1"
        :loading="isLoading"
        :disabled="isLoading"
        @click="socialSignIn('google')"
      >
        <v-icon>mdi-google</v-icon>
      </v-btn>

      <v-btn
        icon
        variant="tonal"
        color="black"
        :loading="isLoading"
        :disabled="isLoading"
        @click="socialSignIn('github')"
      >
        <v-icon>mdi-github</v-icon>
      </v-btn>
    </div>

    <slot />
  </v-card>
</template>
