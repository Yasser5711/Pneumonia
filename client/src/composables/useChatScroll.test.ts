import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { renderComposable } from '../tests/renderComposable'

import { useChatScroll } from './useChatScroll'
describe('useChatScroll', () => {
  const originalScrollTo = window.scrollTo
  const originalScrollY = window.scrollY
  let scrollTopMock = 0

  beforeEach(() => {
    scrollTopMock = 0

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      get: () => scrollTopMock,
    })

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      get: () => 2000,
    })

    // Object.defineProperty(document.documentElement, 'clientHeight', {
    //   configurable: true,
    //   get: () => 800,
    // })

    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    })
  })

  afterEach(() => {
    window.scrollTo = originalScrollTo
    Object.defineProperty(window, 'scrollY', {
      get: () => originalScrollY,
    })
  })

  it('scrollToBottom calls window.scrollTo with correct params', () => {
    const [scroll, app] = renderComposable(() => useChatScroll())
    scroll.scrollToBottom()

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 2000,
      behavior: 'smooth',
    })
    app.unmount()
  })

  it('checkScroll sets isAtBottom and showScrollButton correctly', () => {
    const [scroll, app] = renderComposable(() => useChatScroll())

    // Scroll near bottom
    scrollTopMock = 1140 // 2000 - 1140 - 800 = 60

    scroll.checkScroll()
    expect(scroll.isAtBottom.value).toBe(true)
    expect(scroll.showScrollButton.value).toBe(false)

    // Scroll up
    scrollTopMock = 1000 // 2000 - 1000 - 800 = 200

    scroll.checkScroll()
    expect(scroll.isAtBottom.value).toBe(false)
    expect(scroll.showScrollButton.value).toBe(true)
    app.unmount()
  })

  it('attaches and removes scroll event listeners', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const [composable, app] = renderComposable(() => useChatScroll())
    composable.scrollToBottom(false) // triggers mount logic manually

    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    composable.checkScroll() // simulate call

    removeSpy.mockReset()
    composable.checkScroll() // simulate cleanup
    expect(removeSpy).not.toHaveBeenCalled() // nothing unmounted yet
    app.unmount() // unmount the app
  })
})
