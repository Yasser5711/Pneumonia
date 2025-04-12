import type { Message, TextMessage, ImageMessage, MessageInput } from '../types/chat'

export function createMessage(input: MessageInput): Message {
  const base = {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    status: 'sending' as const,
  }

  if (input.type === 'text') {
    return {
      ...base,
      ...input,
    } satisfies TextMessage
  }

  if (input.type === 'image') {
    return {
      ...base,
      ...input,
    } satisfies ImageMessage
  }

  // If we ever add more types, this will protect us
  throw new Error('Unsupported message type')
}
