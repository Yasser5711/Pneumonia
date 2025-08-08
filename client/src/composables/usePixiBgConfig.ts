import { usePixiBgStore } from '@/stores/pixiBgStore'

export function usePixiBgConfig() {
  const store = usePixiBgStore()

  const { cfg, presets, ...actions } = store
  return { cfg, presets, ...actions }
}
