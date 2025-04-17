// tests/stores/useAppStore.spec.ts
import { useAppStore } from '@/stores/app'
import type { StorageKeys, StorageMap } from '@/types/app'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock useStorage from @vueuse/core
vi.mock('@vueuse/core', () => {
  return {
    useStorage: vi.fn(),
  }
})

import { useStorage } from '@vueuse/core'

// Define a fake ref-like object to mimic useStorage return
function mockStorageRef<T>(initialValue: T) {
  return {
    value: initialValue,
    remove: vi.fn(),
  }
}

describe('useAppStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should return cached storage ref if already set', () => {
    const store = useAppStore()

    const themeKey: StorageKeys = 'theme'
    const defaultValue: StorageMap['theme'] = {
      darkMode: false,
      primaryColor: '#000000',
    }

    const mockRef = mockStorageRef(defaultValue)
    ;(useStorage as unknown as vi.Mock).mockReturnValueOnce(mockRef)

    // First call should cache it
    const ref1 = store.getKeyFromLocalStorage(themeKey, defaultValue)
    expect(ref1.value.darkMode).toBe(false)

    // Second call should return from cache, not call useStorage again
    const ref2 = store.getKeyFromLocalStorage(themeKey, defaultValue)
    expect(useStorage).toHaveBeenCalledTimes(1)
    expect(ref1).toBe(ref2)
  })

  it('should store and return value for new key', () => {
    const store = useAppStore()

    const userKey: StorageKeys = 'user'
    const defaultUser: StorageMap['user'] = {
      id: '123',
      name: 'Test User',
    }

    const mockRef = mockStorageRef(defaultUser)
    ;(useStorage as unknown as vi.Mock).mockReturnValueOnce(mockRef)

    const ref = store.getKeyFromLocalStorage(userKey, defaultUser)

    expect(useStorage).toHaveBeenCalledWith(userKey, defaultUser, localStorage)
    expect(ref.value.name).toBe('Test User')
  })
})
