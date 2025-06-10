<script setup lang="ts">
import ChatWindow from '../components/ChatWindow.vue'

definePage({
  path: '/chat',
  name: 'ChatPage',
  meta: {
    title: 'Chat',
    icon: '/icons/chat.png',
    description: 'Chat with AI',
    layout: 'ChatLayout',
  },
})
</script>

<template>
  <v-main class="fill-height d-flex flex-column justify-end">
    <ChatWindow class="fill-height" />
  </v-main>
</template>
