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
  it('should set key in localStorage and call useStorage when not cached', () => {
    const store = useStorageStore()

    const apiKey: StorageKeys = 'apiKey'
    const value: StorageMap['apiKey'] = 'my-secret-key'

    const mockRef = mockStorageRef(value)
    ;(useStorage as unknown as Mock).mockReturnValueOnce(mockRef)

    store.setKeyInLocalStorage(apiKey, value)

    expect(useStorage).toHaveBeenCalledWith(apiKey, value, localStorage)
    expect(mockRef.value).toBe(value)
  })
  it('should set key in localStorage and update the cache', () => {
    const store = useStorageStore()

    const apiKey: StorageKeys = 'apiKey'
    const value: StorageMap['apiKey'] = 'my-secret-key'

    const mockRef = mockStorageRef('')
    ;(useStorage as unknown as Mock).mockReturnValueOnce(mockRef)
    store.getKeyFromLocalStorage(apiKey, '')
    store.setKeyInLocalStorage(apiKey, value)

    expect(mockRef.value).toBe(value)
  })

  it('should update value if key already exists in cache', () => {
    const store = useStorageStore()

    const key: StorageKeys = 'apiKey'
    const mockRef = mockStorageRef('old-value')
    ;(useStorage as unknown as Mock).mockReturnValue(mockRef)

    store.getKeyFromLocalStorage(key, 'old-value')

    store.setKeyInLocalStorage(key, 'new-value')

    expect(mockRef.value).toBe('new-value')
    expect(useStorage).toHaveBeenCalledTimes(1)
  })

  it('should remove key from cache and localStorage', () => {
    const store = useStorageStore()
    const key: StorageKeys = 'apiKey'

    const mockRef = mockStorageRef('secret')
    ;(useStorage as unknown as Mock).mockReturnValue(mockRef)

    // Prime the cache
    store.getKeyFromLocalStorage(key, 'secret')

    const spy = vi.spyOn(window.localStorage, 'removeItem')

    store.removeKeyFromLocalStorage(key)

    const newMockRef = mockStorageRef('fallback')
    ;(useStorage as unknown as Mock).mockReturnValueOnce(newMockRef)

    const ref = store.getKeyFromLocalStorage(key, 'fallback')
    expect(ref.value).toBe('fallback')
    expect(spy).toHaveBeenCalledWith(key)
  })
})
