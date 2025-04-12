import { faker } from '@faker-js/faker'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { createMessage } from '../helpers/chat'
import type { ChatState, Message, MessageInput } from '../types/chat'

export const useChatStore = defineStore('chat', () => {
  const state = ref<ChatState>({
    messages: [],
    isTyping: false,
  })

  const addMessage = (input: MessageInput) => {
    const newMessage = createMessage(input)
    state.value.messages.push(newMessage)

    setTimeout(() => {
      const msg = state.value.messages.find(m => m.id === newMessage.id)
      if (msg) msg.status = 'sent'
    }, 1000)

    if (input.sender === 'user') {
      simulateAssistantReply(input)
    }
  }

  const simulateAssistantReply = (userInput: MessageInput) => {
    setTyping(true)

    setTimeout(() => {
      const isImageReply = userInput.type === 'image' || Math.random() < 0.5

      const reply: Message = isImageReply
        ? createMessage({
            type: 'image',
            sender: 'assistant',
            url: faker.image.urlLoremFlickr({
              category: 'abstract',
              width: 600,
              height: 400,
            }),
            alt: 'AI-generated image',
            thumbnail: faker.image.urlLoremFlickr({
              category: 'abstract',
              width: 200,
              height: 200,
            }),
          })
        : createMessage({
            type: 'text',
            sender: 'assistant',
            content: `Echo: ${'content' in userInput ? userInput.content : 'Here’s a visual response.'}`,
          })

      state.value.messages.push(reply)
      setTyping(false)
    }, 1200)
  }

  const setTyping = (typing: boolean) => {
    state.value.isTyping = typing
  }

  const messages = computed(() => state.value.messages)
  const isTyping = computed(() => state.value.isTyping)

  return {
    messages,
    isTyping,
    addMessage,
    setTyping,
  }
})
