import { type RemovableRef } from 'vue'
export type StorageKeys =
  | 'theme'
  | 'clock'
  | 'apiKey'
  | 'pixiBgCfg'
  | 'pixiBgPresets'
  | 'lang'
export type ClockState = {
  local: string
  showSeconds: boolean
  showDate: boolean
  options: Intl.DateTimeFormatOptions
}
export type Mode = 'idle' | 'repel' | 'gravity' | 'orbit'
export interface PixiBgCfg {
  mode: Mode
  scale: number
  spacing: number
  length: number
  repelForce: number
  gravityForce: number
  orbitRadius: number
  mouseRadius: number
  transition: number
}
export type ThemeState = {
  mode: 'light' | 'dark' | 'auto'
}
export type LangState = {
  locale: 'en' | 'fr'
}
export type StorageMap = {
  theme: ThemeState
  clock: ClockState
  apiKey: string
  pixiBgCfg: PixiBgCfg
  pixiBgPresets: Record<string, PixiBgCfg>
  lang: LangState
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
      lastLoginAt?: Date
      lastLoginIp?: string
      provider: 'github' | 'google'
      providerId: string
      updatedAt: Date
      quota: Quota
      image?: string
      apiKey?: string | null
    }
  | undefined
