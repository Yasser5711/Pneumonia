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
    icon: '/icons/index.png',
    description: 'Home page',
    layout: 'default',
  },
})
</script>
