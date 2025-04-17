import { type RemovableRef } from 'vue'
export type StorageKeys = 'theme'

export type ThemeState = {
  mode: 'light' | 'dark' | 'auto'
}

export type StorageMap = {
  theme: ThemeState
}
export type StorageValue<K extends keyof StorageMap> = RemovableRef<StorageMap[K]>
