<script setup lang="ts">
import { useApiKeyModal } from '@/components/useApiKeyModal'
import ChatWindow from '../components/ChatWindow.vue'
import { useTheme } from '../composables/useTheme'
definePage({
  path: '/chat',
  name: 'ChatPage',
  meta: {
    title: 'Chat',
    icon: '/icons/chat.png',
    description: 'Chat with AI',
  },
})
const { themeMode, cycleTheme } = useTheme()
const { openModal } = useApiKeyModal()
function onLeftButtonClick() {
  openModal()
}
</script>

<template>
  <div class="bg-background transition-colors duration-300">
    <button
      class="glass-panel hover:bg-primary/20 absolute top-4 right-4 z-50 rounded-full p-2 transition-colors hover:scale-105"
      @click="cycleTheme"
    >
      <span v-if="themeMode.mode === 'light'">🌙</span>
      <span v-else-if="themeMode.mode === 'dark'">☀️</span>
      <span v-else>💻</span>
    </button>
    <button
      class="glass-panel hover:bg-primary/20 absolute top-4 left-4 z-50 rounded-full p-2 transition-colors hover:scale-105"
      @click="onLeftButtonClick"
    >
      🔑
    </button>

    <ChatWindow />
  </div>
</template>
