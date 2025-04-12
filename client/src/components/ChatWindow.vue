<script setup lang="ts">
import { useChatScroll } from '../composables/useChatScroll'
import { useChatStore } from '../stores/chatStore'
import ChatMessage from './ChatMessage.vue'
import ClockDisplay from './ClockDisplay.vue'
import MessageInput from './MessageInput.vue'
import ScrollToBottomButton from './ScrollToBottomButton.vue'

const chatStore = useChatStore()

const { showScrollButton, scrollToBottom } = useChatScroll()
scrollToBottom(false)
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="bg-background p-4">
      <ClockDisplay />
    </header>

    <main class="flex grow flex-col space-y-4 p-4">
      <TransitionGroup name="message">
        <div class="flex flex-grow flex-col space-y-4">
          <ChatMessage
            v-for="message in chatStore.messages"
            :key="message.id"
            :message="message"
          />
        </div>
      </TransitionGroup>

      <!-- If no messages, center fallback block -->
      <div
        v-if="chatStore.messages.length === 0"
        class="text-text/40 flex flex-grow items-center justify-center text-sm"
      >
        Start a conversation ✨
      </div>

      <div
        v-if="chatStore.isTyping"
        class="text-text/60 flex items-center gap-2"
      >
        <div class="typing-indicator">
          <span />
          <span />
          <span />
        </div>
        <span class="text-sm">Assistant is typing...</span>
      </div>
    </main>

    <footer class="bg-background p-4">
      <MessageInput />
    </footer>

    <ScrollToBottomButton
      :show="showScrollButton"
      :on-click="scrollToBottom"
    />
  </div>
</template>

<style scoped>
.typing-indicator {
  display: flex;
  gap: 2px;
}

.typing-indicator span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: currentColor;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}
.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>
