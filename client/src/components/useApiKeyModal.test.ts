import { describe, expect, it } from 'vitest'

import { renderComposable } from '../tests/renderComposable'

import { useApiKeyModal } from './useApiKeyModal'

describe('useApiKeyModal', () => {
  it('should open and close the modal state', () => {
    const [modal] = renderComposable(() => useApiKeyModal())

    expect(modal.isOpen.value).toBe(false)

    modal.openModal()
    expect(modal.isOpen.value).toBe(true)

    modal.closeModal()
    expect(modal.isOpen.value).toBe(false)
  })
})
