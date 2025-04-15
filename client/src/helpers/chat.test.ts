import { createMessage } from '@/helpers/chat'
import type { ImageMessage, MessageInput, TextMessage } from '@/types/chat'
import { describe, expect, it } from 'vitest'

describe('createMessage', () => {
  it('should create a text message with base fields', () => {
    const input: MessageInput = {
      type: 'text',
      sender: 'user',
      content: 'Hello',
    }

    const msg = createMessage(input) as TextMessage

    expect(msg.type).toBe('text')
    expect(msg.content).toBe('Hello')
    expect(msg.sender).toBe('user')
    expect(msg.status).toBe('sending')
    expect(typeof msg.id).toBe('string')
    expect(msg.timestamp).toBeInstanceOf(Date)
  })

  it('should create an image message with base fields', () => {
    const input: MessageInput = {
      type: 'image',
      sender: 'user',
      url: 'https://example.com/image.png',
      alt: 'A cool image',
    }

    const msg = createMessage(input) as ImageMessage

    expect(msg.type).toBe('image')
    expect(msg.url).toBe('https://example.com/image.png')
    expect(msg.alt).toBe('A cool image')
    expect(msg.sender).toBe('user')
    expect(msg.status).toBe('sending')
    expect(typeof msg.id).toBe('string')
    expect(msg.timestamp).toBeInstanceOf(Date)
  })

  it('should throw an error for unsupported message types', () => {
    const input = {
      type: 'video',
      sender: 'user',
      url: 'https://example.com/video.mp4',
    } as unknown as MessageInput

    expect(() => createMessage(input)).toThrowError('Unsupported message type')
  })
})
