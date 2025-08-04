<template>
  <HelloWorld />
</template>

<script lang="ts" setup>
definePage({
  path: '/',
  name: 'IndexPage',
  redirect: '/chat',
  meta: {
    disabled: true,
    title: 'Index',
    icon: '/icons/index.png',
    description: 'Home page',
    layout: 'default',
  },
})
</script>
