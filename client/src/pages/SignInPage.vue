<script setup lang="ts">
const route = useRoute()
const router = useRouter()
definePage({
  path: '/signin',
  name: 'SignIn',
  meta: {
    guestOnly: true,
    title: 'Sign In',
    icon: '/icons/index.png',
    description: 'Sign In page',
    layout: 'default',
  },
})
function handleSubmitted() {
  router.push({ name: 'ChatPage' })
}
</script>

<template>
  <v-container
    class="d-flex flex-column align-center justify-center"
    style="min-height: 100vh"
    ><AuthForm
      mode="signin"
      :initial-email="(route.query.email as string) ?? ''"
      @submitted="handleSubmitted"
  /></v-container>
</template>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
