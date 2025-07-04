<template>
  <HelloWorld />
</template>

<script lang="ts" setup>
definePage({
  path: '/',
  name: 'IndexPage',
  meta: {
    guestOnly: true,
    title: 'Index',
    icon: '/icons/home.png',
    description: 'Home page',
    layout: 'default',
  },
})
</script>
