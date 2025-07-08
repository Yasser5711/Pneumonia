<script setup lang="ts">
import { useGoogleStart, useGithubStart } from '@/queries/useAuth'

const {
  isPending: isGooglePending,
  isError: isGoogleError,
  error: googleError,
  mutate: googleStart,
  data: googleData,
} = useGoogleStart()

const {
  isPending: isGithubPending,
  isError: isGithubError,
  error: githubError,
  mutate: githubStart,
  data: githubData,
} = useGithubStart()

const currentProvider = ref<'google' | 'github' | null>(null)

const loginWithGoogle = () => {
  currentProvider.value = 'google'
  googleStart()
}
const loginWithGithub = () => {
  currentProvider.value = 'github'
  githubStart()
}

watch([googleData, githubData], ([g, gh]) => {
  const url = g?.redirectUrl ?? gh?.redirectUrl
  if (url) window.location.href = url
})
const isSubmitting = computed(
  () => isGooglePending.value || isGithubPending.value,
)
const googleLoading = computed(
  () => isGooglePending.value && currentProvider.value === 'google',
)
const githubLoading = computed(
  () => isGithubPending.value && currentProvider.value === 'github',
)

const errorMessage = computed(() => {
  if (isGoogleError.value)
    return googleError.value?.message ?? 'Google sign-in failed'
  if (isGithubError.value)
    return githubError.value?.message ?? 'GitHub sign-in failed'
  return ''
})
</script>

<template>
  <div class="d-flex align-center fill-height justify-center">
    <v-card
      class="pa-6 text-center"
      max-width="420"
      elevation="10"
      rounded="lg"
    >
      <v-card-title class="text-h5 pb-4">Sign in</v-card-title>

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mb-4"
        :text="errorMessage"
        dismissible
      />

      <v-btn
        block
        size="large"
        elevation="2"
        :loading="googleLoading"
        :disabled="isSubmitting"
        class="text-body-1 font-weight-medium mb-3"
        style="background: #4285f4; color: #fff"
        @click="loginWithGoogle"
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
        :loading="githubLoading"
        :disabled="isSubmitting"
        class="text-body-1 font-weight-medium"
        @click="loginWithGithub"
      >
        <template #prepend><v-icon size="22">mdi-github</v-icon></template>
        Continue with GitHub
      </v-btn>

      <v-progress-linear
        v-if="isSubmitting"
        indeterminate
        color="primary"
        absolute
        bottom
      />
    </v-card>
  </div>
</template>

<style scoped>
.fill-height {
  min-height: 100vh;
} /* mobile-safe full height */
</style>
