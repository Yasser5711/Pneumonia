import type { StorageKeys, StorageMap, StorageValue } from '@/types/app'
import { useStorage, type RemovableRef } from '@vueuse/core'
import { defineStore } from 'pinia'
export const useStorageStore = defineStore('app', () => {
  const storageCache = new Map<StorageKeys, StorageValue<StorageKeys>>()

  function getKeyFromLocalStorage<K extends StorageKeys>(
    key: K,
    defaultValue: StorageMap[K]
  ): RemovableRef<StorageMap[K]> {
    if (storageCache.has(key)) {
      return storageCache.get(key)
    }

    const storageRef = useStorage<StorageMap[K]>(key, defaultValue, localStorage)
    storageCache.set(key, storageRef)
    return storageRef
  }

  return {
    getKeyFromLocalStorage,
  }
})
