<template>
  <BaseLayout>
    <template #header>
      <CanvasBackground />
      <AppHeader />
    </template>

    <template #footer>
      <AppFooter />
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import BaseLayout from './BaseLayout.vue'
</script>
