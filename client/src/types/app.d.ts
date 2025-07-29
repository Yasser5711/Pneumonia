import { type RemovableRef } from 'vue'
export type StorageKeys = 'theme' | 'clock' | 'apiKey'
export type ClockState = {
  local: string
  showSeconds: boolean
  showDate: boolean
  options: Intl.DateTimeFormatOptions
}
export type ThemeState = {
  mode: 'light' | 'dark' | 'auto'
}

export type StorageMap = {
  theme: ThemeState
  clock: ClockState
  apiKey: string
}
export type StorageValue<K extends keyof StorageMap> = RemovableRef<
  StorageMap[K]
>
export type Quota = {
  used: number
  total: number
}
export type User =
  | {
      createdAt: Date
      email: string
      id: string
      lastLogin: Date
      lastUsedIp?: string
      provider: 'github' | 'google'
      providerId: string
      updatedAt: Date
      quota: Quota
      image?: string
      apiKey?: string | null
    }
  | undefined
