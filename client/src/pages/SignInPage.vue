<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const router = useRouter()

const { t } = useI18n()
definePage({
  path: '/signin',
  name: 'SignIn',
  meta: {
    guestOnly: true,
    title: t('signin.title'),
    icon: '/icons/account.png',
    description: t('signin.description'),
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
            {{ t('signin.welcomeBack') }}
          </h1>
          <p class="text-h6 font-weight-regular mb-8 text-center">
            {{ t('signin.logIntoYourAccount') }}
          </p>

          <AuthForm
            mode="signin"
            @submitted="handleSubmitted"
            @toggle-mode="toggleMode"
          >
            <div class="mt-4 text-center">
              <span>{{ t('signin.noAccount') }}</span>
              <v-btn
                variant="text"
                class="text-primary text-none"
                slim
                @click="toggleMode"
              >
                {{ t('signin.signUp') }}
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
