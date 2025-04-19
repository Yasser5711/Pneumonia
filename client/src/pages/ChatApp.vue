<script setup lang="ts">
import ChatWindow from '../components/ChatWindow.vue'
import { useTheme } from '../composables/useTheme'
definePage({
  path: '/chat',
  name: 'ChatPage',
  meta: {
    title: 'Chat',
    description: 'Chat with AI',
  },
})
const { themeMode, cycleTheme } = useTheme()
</script>

<template>
  <div class="bg-background transition-colors duration-300">
    <button
      class="glass-panel hover:bg-primary/20 absolute right-4 top-4 z-50 rounded-full p-2 transition-colors hover:scale-105"
      @click="cycleTheme"
    >
      <span v-if="themeMode.mode === 'light'">🌙</span>
      <span v-else-if="themeMode.mode === 'dark'">☀️</span>
      <span v-else>💻</span>
    </button>

    <ChatWindow />
  </div>
</template>
