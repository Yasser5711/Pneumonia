<template>
  <HelloWorld />
</template>

<script lang="ts" setup>
definePage({
  path: '/',
  name: 'IndexPage',
  meta: {
    requiresAuth: false,
    title: 'Index',
    icon: '/icons/home.png',
    description: 'Home page',
    layout: 'ChatLayout',
  },
})
</script>
