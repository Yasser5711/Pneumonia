<template>
  <RouterViewTransition :route-key="$route.path" />
  <VueQueryDevtools />
  <ServerWakeModal />
  <ServerPulseFab />
</template>
<script setup>
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
</script>
