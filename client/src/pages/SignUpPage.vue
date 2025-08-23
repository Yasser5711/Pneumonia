<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const router = useRouter()

const { t } = useI18n()
definePage({
  path: '/signup',
  name: 'SignUp',
  meta: {
    guestOnly: true,
    title: t('signup.title'),
    icon: '/icons/account.png',
    description: t('signup.description'),
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
  router.push({ name: 'SignIn' })
}
</script>

<template>
  <v-container fluid class="pa-0">
    <v-row no-gutters class="fill-height align-center justify-center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-responsive max-width="420" class="pa-4 mx-auto">
          <Logo class="mx-auto mb-4" style="width: 70%" />

          <h1 class="text-h4 font-weight-bold mb-2 text-center">
            {{ t('signup.createAccount') }}
          </h1>
          <p class="text-h6 font-weight-regular mb-8 text-center">
            {{ t('signup.signUpToGetStarted') }}
          </p>

          <AuthForm
            mode="signup"
            @submitted="handleSubmitted"
            @toggle-mode="toggleMode"
          >
            <div class="text-center">
              <span>{{ t('signup.alreadyHaveAccount') }}</span>
              <v-btn
                variant="text"
                class="text-primary text-none"
                slim
                @click="toggleMode"
              >
                {{ t('signup.signIn') }}
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
