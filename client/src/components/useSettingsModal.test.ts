import { describe, expect, it } from 'vitest'

import { renderComposable } from '../tests/renderComposable'

import { useSettingsModal } from './useSettingsModal'

describe('useSettingsModal', () => {
  it('should open and close the modal state', () => {
    const [modal] = renderComposable(() => useSettingsModal())

    expect(modal.isSettingsOpen.value).toBe(false)

    modal.openModal()
    expect(modal.isSettingsOpen.value).toBe(true)

    modal.closeModal()
    expect(modal.isSettingsOpen.value).toBe(false)
  })
})
