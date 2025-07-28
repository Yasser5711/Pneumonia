<script setup lang="ts">
import { useAuthForm } from '../composables/useAuthForm'

const props = defineProps<{
  mode: 'signin' | 'signup'
  initialEmail?: string
}>()

const emit = defineEmits<{ submitted: [] }>()

const auth = useAuthForm()

if (props.initialEmail) auth.email.value = props.initialEmail

const handle = async () => {
  try {
    props.mode === 'signup' ? await auth.signUp() : await auth.signIn()
    emit('submitted')
  } catch {
    /* auth.errorMsg */
  }
}

const showName = computed(() => props.mode === 'signup')
</script>

<template>
  <div class="d-flex align-center fill-height justify-center">
    <v-card
      class="pa-6 text-center"
      max-width="420"
      elevation="10"
      rounded="lg"
    >
      <v-card-title class="text-h5 pb-4">
        {{ props.mode === 'signup' ? 'SignUp' : 'SignIn' }}
      </v-card-title>

      <v-alert
        v-if="auth.errorMsg"
        type="error"
        variant="tonal"
        class="mb-4"
        :text="auth.errorMsg.value"
        dismissible
      />

      <v-text-field
        v-model="auth.email"
        label="Email"
        type="email"
        variant="outlined"
        :rules="[(v) => !!v || 'Email is required']"
        :disabled="auth.isLoading.value"
      />
      <v-text-field
        v-model="auth.password"
        label="Password"
        type="password"
        variant="outlined"
        :rules="[(v) => !!v || 'Password is required']"
        :disabled="auth.isLoading.value"
      />
      <!-- SignUp -->
      <template v-if="showName">
        <v-text-field
          v-model="auth.firstName"
          label="First Name"
          variant="outlined"
          :rules="[(v) => !!v || 'First Name is required']"
          :disabled="auth.isLoading.value"
        />
        <v-text-field
          v-model="auth.lastName"
          label="Last Name"
          variant="outlined"
          :rules="[(v) => !!v || 'Last Name is required']"
          :disabled="auth.isLoading.value"
        />
      </template>

      <v-btn
        block
        size="large"
        elevation="2"
        :loading="auth.isLoading.value"
        :disabled="auth.isLoading.value"
        @click="handle"
      >
        {{ props.mode === 'signup' ? 'Create account' : 'Continue' }}
      </v-btn>
    </v-card>
  </div>
</template>
