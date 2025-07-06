import { describe, expect, it } from 'vitest'

import { renderComposable } from '../tests/renderComposable'

import { useProfileModal } from './useProfileModal'

describe('useProfileModal', () => {
  it('should open and close the modal state', () => {
    const [modal] = renderComposable(() => useProfileModal())

    expect(modal.isProfileOpen.value).toBe(false)

    modal.openModal()
    expect(modal.isProfileOpen.value).toBe(true)

    modal.closeModal()
    expect(modal.isProfileOpen.value).toBe(false)
  })
})
