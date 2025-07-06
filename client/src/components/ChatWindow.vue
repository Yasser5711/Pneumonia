<script setup lang="ts">
import { onMounted } from 'vue'

import { useChatScroll } from '@/composables/useChatScroll'
import { useChatStore } from '@/stores/chatStore'

const chatStore = useChatStore()
const { showScrollButton, scrollToBottom } = useChatScroll()

onMounted(() => {
  scrollToBottom(false)
})
useHead({
  title: () =>
    chatStore.isTyping
      ? 'Assistant is typing...'
      : chatStore.messages.length === 0
        ? 'Waiting to start a conversation'
        : `Chat - ${chatStore.userMessages.length} messages`,
})
</script>

<template>
  <div class="d-flex flex-column fill-height justify-space-between">
    <div class="flex-grow-1" style="min-height: 0; overflow-y: hidden">
      <transition-group name="message">
        <div v-for="message in chatStore.messages" :key="message.id">
          <ChatMessage :message="message" />
        </div>
      </transition-group>

      <div
        v-if="chatStore.messages.length === 0"
        class="d-flex flex-column align-center justify-center"
        style="height: 100%; opacity: 0.4"
      >
        <span class="text-body-2">Waiting to start a conversation</span>
        <div class="d-flex mt-2">
          <span class="dot-bounce mr-1"></span>
          <span class="dot-bounce mr-1" style="animation-delay: 0.15s"></span>
          <span class="dot-bounce" style="animation-delay: 0.3s"></span>
        </div>
      </div>

      <div
        v-if="chatStore.isTyping"
        class="d-flex align-center mt-2 ml-2"
        style="opacity: 0.6; font-size: 0.875rem"
      >
        <div class="d-flex mr-2">
          <span class="dot-bounce mr-1"></span>
          <span class="dot-bounce mr-1" style="animation-delay: 0.15s"></span>
          <span class="dot-bounce" style="animation-delay: 0.3s"></span>
        </div>
        <span>Assistant is typing</span>
      </div>
    </div>

    <div class="flex-shrink-0">
      <div class="pa-4">
        <MessageInput />
      </div>
    </div>

    <ScrollToBottomButton :show="showScrollButton" :on-click="scrollToBottom" />
  </div>
</template>

<style scoped>
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-3px);
  }
}

.dot-bounce {
  width: 6px;
  height: 6px;
  background-color: currentcolor;
  border-radius: 50%;
  display: inline-block;
  animation: bounce 0.8s infinite ease-in-out;
}

.d-flex-custom {
  display: flex !important;
  justify-content: flex-end !important;
}
</style>
