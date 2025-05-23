export type MessageType = 'text' | 'image'

export interface BaseMessage {
  id: string
  sender: 'user' | 'assistant'
  timestamp: Date
  status: 'sending' | 'sent' | 'delivered' | 'read'
}

export interface TextMessage extends BaseMessage {
  type: 'text'
  content: string
}

export interface ImageMessage extends BaseMessage {
  type: 'image'
  url: string
  alt?: string
  thumbnail?: string
  //content?: string;
}

export type Message = TextMessage | ImageMessage

export interface ChatState {
  messages: Message[]
  isTyping: boolean
}
export type MessageInput =
  | Omit<TextMessage, 'id' | 'timestamp' | 'status'>
  | Omit<ImageMessage, 'id' | 'timestamp' | 'status'>
