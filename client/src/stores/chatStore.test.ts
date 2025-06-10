import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useChatStore } from '../stores/chatStore'

import type { ImageMessage, MessageInput, TextMessage } from '../types/chat'

describe('useChatStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with default state', () => {
    const store = useChatStore()

    expect(store.messages).toEqual([])
    expect(store.isTyping).toBe(false)
    expect(store.isLoading).toBe(false)
    expect(store.userMessages).toEqual([])
    expect(store.assistantMessages).toEqual([])
  })

  it('setLoading should update isLoading ref', () => {
    const store = useChatStore()
    store.setLoading(true)

    expect(store.isLoading).toBe(true)

    store.setLoading(false)
    expect(store.isLoading).toBe(false)
  })

  it('setTyping should update isTyping state', () => {
    const store = useChatStore()
    store.setTyping(true)

    expect(store.isTyping).toBe(true)

    store.setTyping(false)
    expect(store.isTyping).toBe(false)
  })

  it('addMessage should add user message and assistant echo', () => {
    const store = useChatStore()

    const input: MessageInput = {
      type: 'text',
      sender: 'user',
      content: 'Hello world',
    }

    store.addMessage(input)
    const output = store.messages as TextMessage[]
    expect(output.length).toBe(2)
    expect(output[0].sender).toBe('user')
    expect(output[0].content).toBe('Hello world')
    expect(output[1].sender).toBe('assistant')
    expect(output[1].content).toBe(
      '⚠️ Oops! Chat content isn’t available yet. Please try again later. 💬',
    )
    expect(store.userMessages.length).toBe(1)
    expect(store.assistantMessages.length).toBe(1)
  })

  it('addMessage should add visual response for non-text', () => {
    const store = useChatStore()

    const input: MessageInput = {
      type: 'image',
      sender: 'user',
      url: 'https://example.com/image.jpg',
    }

    store.addMessage(input)
    const output = store.messages as ImageMessage[]
    expect(output.length).toBe(1)
    expect(output[0].url).toBe('https://example.com/image.jpg')
    expect(output[0].sender).toBe('user')
    expect(store.userMessages.length).toBe(1)
    expect(store.assistantMessages.length).toBe(0)
  })

  it('should mark message as "sent" after timeout', async () => {
    vi.useFakeTimers()
    const store = useChatStore()

    const input: MessageInput = {
      type: 'text',
      sender: 'user',
      content: 'Delayed message',
    }

    store.addMessage(input)

    const addedMessage = store.messages[0]

    expect(addedMessage.status).not.toBe('sent')

    vi.advanceTimersByTime(1000)

    const updated = store.messages.find((m) => m.id === addedMessage.id)
    expect(updated?.status).toBe('sent')
  })
})
