<script setup lang="ts">
import { useChatScroll } from "../composables/useChatScroll";
import { useChatStore } from "../stores/chatStore";
import ChatMessage from "./ChatMessage.vue";
import ClockDisplay from "./ClockDisplay.vue";
import MessageInput from "./MessageInput.vue";
import ScrollToBottomButton from "./ScrollToBottomButton.vue";

const chatStore = useChatStore();

const { showScrollButton, scrollToBottom } = useChatScroll();
scrollToBottom(false);
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <header class="bg-background p-4">
      <ClockDisplay />
    </header>

    <main class="p-4 space-y-4 flex flex-col grow">
      <TransitionGroup name="message">
        <div class="flex flex-col space-y-4 flex-grow">
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
        class="flex-grow flex items-center justify-center text-text/40 text-sm"
      >
        Start a conversation ✨
      </div>

      <div
        v-if="chatStore.isTyping"
        class="flex items-center gap-2 text-text/60"
      >
        <div class="typing-indicator">
          <span />
          <span />
          <span />
        </div>
        <span class="text-sm">Assistant is typing...</span>
      </div>
    </main>

    <footer class="p-4 bg-background">
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
