<template>
  <v-container
    class="d-flex flex-column align-center justify-center"
    style="height: 100vh"
  >
    <v-empty-state
      headline="Whoops, 404"
      title="Page not found"
      text="The page you were looking for does not exist"
      to="/chat"
      ><template #media
        ><Icon icon="line-md:alert-circle-loop" width="100%"
      /></template>
      <template #actions>
        <v-btn variant="text" @click="safeBack">Go Back</v-btn>
      </template>
    </v-empty-state>
  </v-container>
</template>
<script setup>
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
definePage({
  name: 'NotFound',
  meta: {
    title: t('404.title'),
    icon: '/icons/404.png',
    description: t('404.description'),
    layout: 'default',
  },
})
const router = useRouter()
function safeBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'ChatPage' })
  }
}
</script>
