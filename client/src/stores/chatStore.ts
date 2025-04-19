import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { createMessage } from '../helpers/chat'
import type { ChatState, MessageInput } from '../types/chat'

export const useChatStore = defineStore('chat', () => {
  const state = ref<ChatState>({
    messages: [],
    isTyping: false,
  })
  const isLoading = ref(false)

  const setLoading = (val: boolean) => {
    isLoading.value = val
  }
  const addMessage = (input: MessageInput) => {
    const newMessage = createMessage(input)
    state.value.messages.push(newMessage)

    setTimeout(() => {
      const msg = state.value.messages.find((m) => m.id === newMessage.id)
      if (msg) msg.status = 'sent'
    }, 1000)
    if (input.sender === 'user' && input.type === 'text') {
      const reply = createMessage({
        type: 'text',
        sender: 'assistant',
        content: `Echo: ${'content' in input ? input.content : 'Here’s a visual response.'}`,
      })

      state.value.messages.push(reply)
      setTyping(false)
    }
  }

  const setTyping = (typing: boolean) => {
    state.value.isTyping = typing
  }

  const messages = computed(() => state.value.messages)
  const isTyping = computed(() => state.value.isTyping)

  return {
    messages,
    isTyping,
    isLoading: computed(() => isLoading.value),
    setLoading,
    addMessage,
    setTyping,
  }
})
