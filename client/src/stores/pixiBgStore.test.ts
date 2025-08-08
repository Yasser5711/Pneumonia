import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

import type { PixiBgCfg } from '@/types/app'

import { usePixiBgStore } from './pixiBgStore'
import { useStorageStore } from './storageStore'

vi.mock('./storageStore', () => ({
  useStorageStore: vi.fn(),
}))

vi.mock('@vueuse/core', () => ({
  useDebounceFn: vi.fn((fn) => fn),
}))

describe('usePixiBgStore', () => {
  let mockStorageStore: {
    getKeyFromLocalStorage: ReturnType<typeof vi.fn>
    setKeyInLocalStorage: ReturnType<typeof vi.fn>
  }

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

  beforeEach(() => {
    setActivePinia(createPinia())

    mockStorageStore = {
      getKeyFromLocalStorage: vi.fn(),
      setKeyInLocalStorage: vi.fn(),
    }

    vi.mocked(useStorageStore as unknown as Mock).mockReturnValue(
      mockStorageStore,
    )

    mockStorageStore.getKeyFromLocalStorage.mockImplementation(
      (key, defaultValue) => {
        if (key === 'pixiBgCfg') {
          return { value: { ...DEFAULT_CFG } }
        }
        if (key === 'pixiBgPresets') {
          return { value: {} }
        }
        return { value: defaultValue }
      },
    )
  })

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const store = usePixiBgStore()

      expect(store.cfg).toEqual(DEFAULT_CFG)
      expect(mockStorageStore.getKeyFromLocalStorage).toHaveBeenCalledWith(
        'pixiBgCfg',
        DEFAULT_CFG,
      )
      expect(mockStorageStore.getKeyFromLocalStorage).toHaveBeenCalledWith(
        'pixiBgPresets',
        {},
      )
    })

    it('should initialize with stored configuration', () => {
      const customCfg: PixiBgCfg = {
        ...DEFAULT_CFG,
        mode: 'repel',
        scale: 300,
      }

      mockStorageStore.getKeyFromLocalStorage.mockImplementation(
        (key, defaultValue) => {
          if (key === 'pixiBgCfg') {
            return { value: customCfg }
          }
          if (key === 'pixiBgPresets') {
            return { value: {} }
          }
          return { value: defaultValue }
        },
      )

      const store = usePixiBgStore()

      expect(store.cfg).toEqual(customCfg)
    })
  })

  describe('configuration updates', () => {
    it('should update configuration with partial values', () => {
      const store = usePixiBgStore()

      store.update({ mode: 'gravity', scale: 350 })

      expect(store.cfg.mode).toBe('gravity')
      expect(store.cfg.scale).toBe(350)
      expect(store.cfg.spacing).toBe(DEFAULT_CFG.spacing)
    })

    it('should reset configuration to default values', () => {
      const store = usePixiBgStore()

      store.update({ mode: 'orbit', scale: 500 })

      store.reset()

      expect(store.cfg).toEqual(DEFAULT_CFG)
    })
  })

  describe('individual setters', () => {
    it('should set mode correctly', () => {
      const store = usePixiBgStore()

      store.setMode('repel')
      expect(store.cfg.mode).toBe('repel')

      store.setMode('gravity')
      expect(store.cfg.mode).toBe('gravity')
    })

    it('should set scale correctly', () => {
      const store = usePixiBgStore()

      store.setScale(250)
      expect(store.cfg.scale).toBe(250)
    })

    it('should set spacing correctly', () => {
      const store = usePixiBgStore()

      store.setSpacing(20)
      expect(store.cfg.spacing).toBe(20)
    })

    it('should set length correctly', () => {
      const store = usePixiBgStore()

      store.setLength(10)
      expect(store.cfg.length).toBe(10)
    })

    it('should set repelForce correctly', () => {
      const store = usePixiBgStore()

      store.setRepelForce(60)
      expect(store.cfg.repelForce).toBe(60)
    })

    it('should set gravityForce correctly', () => {
      const store = usePixiBgStore()

      store.setGravityForce(50)
      expect(store.cfg.gravityForce).toBe(50)
    })

    it('should set orbitRadius correctly', () => {
      const store = usePixiBgStore()

      store.setOrbitRadius(80)
      expect(store.cfg.orbitRadius).toBe(80)
    })

    it('should set mouseRadius correctly', () => {
      const store = usePixiBgStore()

      store.setMouseRadius(200)
      expect(store.cfg.mouseRadius).toBe(200)
    })

    it('should set transition correctly', () => {
      const store = usePixiBgStore()

      store.setTransition(0.2)
      expect(store.cfg.transition).toBe(0.2)
    })
  })

  describe('preset management', () => {
    it('should save a preset', () => {
      const store = usePixiBgStore()

      store.update({ mode: 'gravity', scale: 300 })

      store.savePreset('myPreset')

      expect(store.presets.value).toEqual({
        myPreset: {
          ...DEFAULT_CFG,
          mode: 'gravity',
          scale: 300,
        },
      })
      expect(mockStorageStore.setKeyInLocalStorage).toHaveBeenCalledWith(
        'pixiBgPresets',
        expect.objectContaining({
          myPreset: expect.objectContaining({
            mode: 'gravity',
            scale: 300,
          }),
        }),
      )
    })

    it('should load a preset', () => {
      const preset: PixiBgCfg = {
        ...DEFAULT_CFG,
        mode: 'orbit',
        scale: 400,
      }

      mockStorageStore.getKeyFromLocalStorage.mockImplementation(
        (key, defaultValue) => {
          if (key === 'pixiBgCfg') {
            return { value: { ...DEFAULT_CFG } }
          }
          if (key === 'pixiBgPresets') {
            return { value: { testPreset: preset } }
          }
          return { value: defaultValue }
        },
      )

      const store = usePixiBgStore()

      store.loadPreset('testPreset')

      expect(store.cfg).toEqual(preset)
    })

    it('should not load non-existent preset', () => {
      const store = usePixiBgStore()
      const originalCfg = { ...store.cfg }

      store.loadPreset('nonExistentPreset')

      expect(store.cfg).toEqual(originalCfg)
    })

    it('should delete a preset', () => {
      const preset: PixiBgCfg = {
        ...DEFAULT_CFG,
        mode: 'orbit',
        scale: 400,
      }

      mockStorageStore.getKeyFromLocalStorage.mockImplementation(
        (key, defaultValue) => {
          if (key === 'pixiBgCfg') {
            return { value: { ...DEFAULT_CFG } }
          }
          if (key === 'pixiBgPresets') {
            return { value: { testPreset: preset, anotherPreset: preset } }
          }
          return { value: defaultValue }
        },
      )

      const store = usePixiBgStore()

      expect(store.presets.value).toHaveProperty('testPreset')

      store.deletePreset('testPreset')

      expect(store.presets.value).not.toHaveProperty('testPreset')
      expect(store.presets.value).toHaveProperty('anotherPreset')
      expect(mockStorageStore.setKeyInLocalStorage).toHaveBeenCalledWith(
        'pixiBgPresets',
        expect.not.objectContaining({
          testPreset: expect.anything(),
        }),
      )
    })
  })

  describe('randomize', () => {
    it('should randomize all configuration values within expected ranges', () => {
      const store = usePixiBgStore()

      const mockRandom = vi.spyOn(Math, 'random')
      mockRandom.mockReturnValueOnce(0.5)
      mockRandom.mockReturnValueOnce(0.5)
      mockRandom.mockReturnValueOnce(0.5)
      mockRandom.mockReturnValueOnce(0.5)
      mockRandom.mockReturnValueOnce(0.5)
      mockRandom.mockReturnValueOnce(0.5)
      mockRandom.mockReturnValueOnce(0.5)
      mockRandom.mockReturnValueOnce(0.5)
      mockRandom.mockReturnValueOnce(0.5)

      store.randomize()

      expect(store.cfg.scale).toBe(500)
      expect(store.cfg.spacing).toBe(25)
      expect(store.cfg.length).toBe(10)
      expect(store.cfg.repelForce).toBe(50)
      expect(store.cfg.gravityForce).toBe(50)
      expect(store.cfg.orbitRadius).toBe(50)
      expect(store.cfg.mouseRadius).toBe(150)
      expect(store.cfg.transition).toBe(0.15)
      expect(store.cfg.mode).toBe('gravity')

      mockRandom.mockRestore()
    })

    it('should generate values within valid ranges', () => {
      const store = usePixiBgStore()

      for (let i = 0; i < 10; i++) {
        store.randomize()

        expect(store.cfg.scale).toBeGreaterThanOrEqual(100)
        expect(store.cfg.scale).toBeLessThanOrEqual(900)

        expect(store.cfg.spacing).toBeGreaterThanOrEqual(10)
        expect(store.cfg.spacing).toBeLessThanOrEqual(40)

        expect(store.cfg.length).toBeGreaterThanOrEqual(3)
        expect(store.cfg.length).toBeLessThanOrEqual(18)

        expect(store.cfg.repelForce).toBeGreaterThanOrEqual(20)
        expect(store.cfg.repelForce).toBeLessThanOrEqual(80)

        expect(store.cfg.gravityForce).toBeGreaterThanOrEqual(20)
        expect(store.cfg.gravityForce).toBeLessThanOrEqual(80)

        expect(store.cfg.orbitRadius).toBeGreaterThanOrEqual(20)
        expect(store.cfg.orbitRadius).toBeLessThanOrEqual(80)

        expect(store.cfg.mouseRadius).toBeGreaterThanOrEqual(50)
        expect(store.cfg.mouseRadius).toBeLessThanOrEqual(250)

        expect(store.cfg.transition).toBeGreaterThanOrEqual(0.05)
        expect(store.cfg.transition).toBeLessThanOrEqual(0.25)

        expect(['idle', 'repel', 'gravity', 'orbit']).toContain(store.cfg.mode)
      }
    })
  })

  describe('store interface', () => {
    it('should expose all expected properties and methods', () => {
      const store = usePixiBgStore()
      expect(store.cfg).toBeDefined()
      expect(store.presets).toBeDefined()

      expect(typeof store.update).toBe('function')
      expect(typeof store.reset).toBe('function')
      expect(typeof store.randomize).toBe('function')
      expect(typeof store.savePreset).toBe('function')
      expect(typeof store.loadPreset).toBe('function')
      expect(typeof store.deletePreset).toBe('function')

      expect(typeof store.setMode).toBe('function')
      expect(typeof store.setScale).toBe('function')
      expect(typeof store.setSpacing).toBe('function')
      expect(typeof store.setLength).toBe('function')
      expect(typeof store.setRepelForce).toBe('function')
      expect(typeof store.setGravityForce).toBe('function')
      expect(typeof store.setOrbitRadius).toBe('function')
      expect(typeof store.setMouseRadius).toBe('function')
      expect(typeof store.setTransition).toBe('function')
    })
  })
})
