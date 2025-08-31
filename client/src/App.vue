<template>
  <RouterViewTransition :route-key="$route.path" />
  <VueQueryDevtools />
  <ServerWakeModal />
  <ServerPulseFab />
  <VSonner position="top-right" />
</template>
<script setup>
import 'vuetify-sonner/style.css'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { VSonner } from 'vuetify-sonner'
</script>
