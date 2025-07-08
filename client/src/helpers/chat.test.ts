import { describe, expect, it } from 'vitest'

import { createMessage } from '../helpers/chat'

import type {
  ImageMessage,
  MessageInput,
  TextMessage,
  PredictionMessage,
} from '../types/chat'

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
  it('should create a prediction message with base fields', () => {
    const input: MessageInput = {
      type: 'prediction',
      sender: 'user',
      originalImageName: 'chest-xray.png',
      prediction: {
        class: 'pneumonia',
        probability: 0.95,
      },
      heatmapUrl: 'data:image/png;base64,...',
    }
    const msg = createMessage(input) as PredictionMessage
    expect(msg.type).toBe('prediction')
    expect(msg.prediction.class).toBe('pneumonia')
    expect(msg.prediction.probability).toBe(0.95)
    expect(msg.heatmapUrl).toBe('data:image/png;base64,...')
    expect(msg.sender).toBe('user')
    expect(msg.status).toBe('sending')
    expect(msg.originalImageName).toBe('chest-xray.png')
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
