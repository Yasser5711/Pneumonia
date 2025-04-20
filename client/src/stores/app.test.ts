import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '../stores/app'

describe('useAppStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should instantiate correctly', () => {
    const store = useAppStore()

    expect(store).toBeDefined()

    expect(store.$state).toEqual({})
  })
})
