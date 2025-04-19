import { useStorage } from '@vueuse/core'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useStorageStore } from '../stores/storageStore'
import type { StorageKeys, StorageMap } from '../types/app'
vi.mock('@vueuse/core', () => {
  return {
    useStorage: vi.fn(),
  }
})

function mockStorageRef<T>(initialValue: T) {
  return {
    value: initialValue,
    remove: vi.fn(),
  }
}

describe('useStorageStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should return cached storage ref if already set', () => {
    const store = useStorageStore()

    const themeKey: StorageKeys = 'theme'
    const defaultValue: StorageMap['theme'] = {
      mode: 'auto',
    }

    const mockRef = mockStorageRef(defaultValue)
    ;(useStorage as unknown as Mock).mockReturnValueOnce(mockRef)

    const ref1 = store.getKeyFromLocalStorage(themeKey, defaultValue)
    expect(ref1.value.mode).toBe('auto')
    expect(useStorage).toHaveBeenCalledWith(
      themeKey,
      defaultValue,
      localStorage,
    )

    const ref2 = store.getKeyFromLocalStorage(themeKey, defaultValue)
    expect(useStorage).toHaveBeenCalledTimes(1)
    expect(ref1).toBe(ref2)
  })
})
