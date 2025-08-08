<script setup lang="ts">
const router = useRouter()

definePage({
  path: '/signin',
  name: 'SignIn',
  meta: {
    guestOnly: true,
    title: 'Sign In',
    icon: '/icons/account.png',
    description: 'Sign In page',
    layout: 'default',
    transitions: {
      enter: 'slide-up',
      leave: 'fade',
    },
  },
})

function handleSubmitted() {
  router.push({ name: 'ChatPage' })
}

function toggleMode() {
  router.push({ name: 'SignUp' })
}
</script>

<template>
  <v-container fluid class="pa-0 fill-height">
    <v-row no-gutters class="fill-height align-center justify-center">
      <v-col cols="12" sm="10" md="6" lg="4">
        <v-responsive max-width="420" class="pa-4 mx-auto">
          <Logo class="mx-auto mb-4" style="width: 70%" />

          <h1 class="text-h4 font-weight-bold mb-2 text-center">
            Welcome back!
          </h1>
          <p class="text-h6 font-weight-regular mb-8 text-center">
            Log into your account
          </p>

          <AuthForm
            mode="signin"
            @submitted="handleSubmitted"
            @toggle-mode="toggleMode"
          >
            <div class="mt-4 text-center">
              <span>Don't have an account?</span>
              <v-btn
                variant="text"
                class="text-primary text-none"
                slim
                @click="toggleMode"
              >
                Sign up
              </v-btn>
            </div>
          </AuthForm>
        </v-responsive>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
