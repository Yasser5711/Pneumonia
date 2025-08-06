import { useDebounceFn } from '@vueuse/core'
import { defineStore } from 'pinia'

import type { PixiBgCfg } from '@/types/app'

import { useStorageStore } from './storageStore'

const DEFAULT_CFG: PixiBgCfg = {
  mode: 'idle',
  scale: 200,
  spacing: 15,
  length: 5,
  repelForce: 40,
  gravityForce: 30,
  orbitRadius: 40,
  mouseRadius: 140,
  transition: 0.1,
}

export const usePixiBgStore = defineStore('pixiBg', () => {
  const storage = useStorageStore()
  const stored = storage.getKeyFromLocalStorage('pixiBgCfg', DEFAULT_CFG)
  const presets = storage.getKeyFromLocalStorage('pixiBgPresets', {})
  const cfg = reactive<PixiBgCfg>({ ...stored.value })

  const persist = useDebounceFn(() => {
    storage.setKeyInLocalStorage('pixiBgCfg', { ...cfg })
  }, 300)

  watch(cfg, persist, { deep: true })

  function update(partial: Partial<PixiBgCfg>) {
    Object.assign(cfg, partial)
  }
  function savePreset(name: string) {
    presets.value[name] = { ...cfg }
    storage.setKeyInLocalStorage('pixiBgPresets', presets.value)
  }

  function loadPreset(name: string) {
    if (presets.value[name]) {
      update(presets.value[name])
    }
  }

  function deletePreset(name: string) {
    delete presets.value[name]
    storage.setKeyInLocalStorage('pixiBgPresets', presets.value)
  }

  const setters = {
    setMode: (v: PixiBgCfg['mode']) => (cfg.mode = v),
    setScale: (v: number) => (cfg.scale = v),
    setSpacing: (v: number) => (cfg.spacing = v),
    setLength: (v: number) => (cfg.length = v),
    setRepelForce: (v: number) => (cfg.repelForce = v),
    setGravityForce: (v: number) => (cfg.gravityForce = v),
    setOrbitRadius: (v: number) => (cfg.orbitRadius = v),
    setMouseRadius: (v: number) => (cfg.mouseRadius = v),
    setTransition: (v: number) => (cfg.transition = v),
  }

  function reset() {
    Object.assign(cfg, DEFAULT_CFG)
  }
  function randomize() {
    update({
      scale: Math.floor(Math.random() * 800) + 100, // 100 → 900
      spacing: Math.floor(Math.random() * 30) + 10, // 10 → 40
      length: Math.floor(Math.random() * 15) + 3, // 3 → 18
      repelForce: Math.floor(Math.random() * 60) + 20, // 20 → 80
      gravityForce: Math.floor(Math.random() * 60) + 20,
      orbitRadius: Math.floor(Math.random() * 60) + 20,
      mouseRadius: Math.floor(Math.random() * 200) + 50,
      transition: +(Math.random() * 0.2 + 0.05).toFixed(2), // 0.05 → 0.25
      mode: ['idle', 'repel', 'gravity', 'orbit'][
        Math.floor(Math.random() * 4)
      ] as PixiBgCfg['mode'],
    })
  }
  return {
    cfg,
    update,
    reset,
    ...setters,
    savePreset,
    loadPreset,
    deletePreset,
    presets,
    randomize,
  }
})
