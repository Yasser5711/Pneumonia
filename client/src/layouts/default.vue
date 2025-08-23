<template>
  <h1>{{ t('app.title') }}</h1>
  <v-btn @click="switchTo('fr')">Switch to French</v-btn>
  <v-btn @click="switchTo('en')">Switch to English</v-btn>
  <BaseLayout />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import BaseLayout from './BaseLayout.vue'
const { t, locale } = useI18n()

function switchTo(l: string) {
  locale.value = l
  document.documentElement.setAttribute('lang', l)
}
</script>
