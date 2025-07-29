<script setup lang="ts">
const router = useRouter()
definePage({
  path: '/signup',
  name: 'SignUp',
  meta: {
    guestOnly: true,
    title: 'Sign Up',
    icon: '/icons/index.png',
    description: 'Sign Up page',
    layout: 'default',
  },
})
function handleSubmitted() {
  router.push({ name: 'SignIn', query: { email: '' } })
}
</script>

<template>
  <v-container
    class="d-flex align-center justify-center"
    style="min-height: 100vh"
  >
    <AuthForm mode="signup" @submitted="handleSubmitted"
  /></v-container>
</template>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
