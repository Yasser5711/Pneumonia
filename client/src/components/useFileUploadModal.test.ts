import { describe, expect, it } from 'vitest'

import { renderComposable } from '../tests/renderComposable'

import { useFileUploadModal } from './useFileUploadModal'

describe('useFileUploadModal', () => {
  it('should open and close the modal state', () => {
    const [modal] = renderComposable(() => useFileUploadModal())

    expect(modal.isFileUploadModalOpen.value).toBe(false)

    modal.openModal()
    expect(modal.isFileUploadModalOpen.value).toBe(true)

    modal.closeModal()
    expect(modal.isFileUploadModalOpen.value).toBe(false)
  })
})
