import type { StorageKeys, StorageMap, StorageValue } from '@/types/app'
import { useStorage, type RemovableRef } from '@vueuse/core'
import { defineStore } from 'pinia'
export const useStorageStore = defineStore('app', () => {
  const storageCache: Partial<Record<StorageKeys, StorageValue<StorageKeys>>> =
    {}

  function getKeyFromLocalStorage<K extends StorageKeys>(
    key: K,
    defaultValue?: StorageMap[K],
  ): RemovableRef<StorageMap[K]> {
    if (storageCache[key]) {
      return storageCache[key] as RemovableRef<StorageMap[K]>
    }

    const storageRef = useStorage<StorageMap[K]>(
      key,
      defaultValue as StorageMap[K],
      localStorage,
    )

    storageCache[key] = storageRef
    return storageRef
  }
  function setKeyInLocalStorage<K extends StorageKeys>(
    key: K,
    value: StorageMap[K],
  ) {
    if (storageCache[key]) {
      storageCache[key].value = value
    } else {
      const storageRef = useStorage<StorageMap[K]>(
        key,
        value as StorageMap[K],
        localStorage,
      )
      storageCache[key] = storageRef
    }
  }
  function removeKeyFromLocalStorage<K extends StorageKeys>(key: K) {
    delete storageCache[key]
    localStorage.removeItem(key)
  }

  return {
    getKeyFromLocalStorage,
    setKeyInLocalStorage,
    removeKeyFromLocalStorage,
  }
})
