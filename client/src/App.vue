<template>
  <RouterViewTransition :route-key="$route.path" />
  <VueQueryDevtools />
</template>
<script setup>
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
</script>
