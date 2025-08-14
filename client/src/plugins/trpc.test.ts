import type { App } from 'vue'

import { httpBatchLink, httpSubscriptionLink } from '@trpc/client'
import { describe, expect, it, vi, type Mock } from 'vitest'

import { createTRPCPlugin, getTRPCClient } from './trpc'

vi.mock('@trpc/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@trpc/client')>()
  return {
    ...actual,
    createTRPCClient: vi.fn().mockReturnValue('mockedClient'),
    httpBatchLink: vi.fn().mockReturnValue(() => {}),
    httpSubscriptionLink: vi.fn().mockReturnValue(() => {}),
  }
})

vi.mock('@/stores/storageStore', () => {
  const setKeyInLocalStorage = vi.fn()
  const getKeyFromLocalStorage = vi
    .fn()
    .mockReturnValue({ value: 'test-api-key' })

  return {
    useStorageStore: vi.fn(() => ({
      setKeyInLocalStorage,
      getKeyFromLocalStorage,
    })),
  }
})
describe('createTRPCPlugin', () => {
  it('injects a tRPC client with correct config into Vue app', () => {
    const app = { config: { globalProperties: {} } }
    const plugin = createTRPCPlugin({
      url: 'https://api.example.com/trpc',
    })

    plugin.install(app as unknown as App)
    // @ts-expect-error: $trpc is mocked in test
    expect(app.config.globalProperties.$trpc).toBe('mockedClient')

    expect(httpBatchLink).toHaveBeenCalledWith({
      url: 'https://api.example.com/trpc',
      transformer: expect.any(Function),
      headers: expect.any(Function),
      fetch: expect.any(Function),
    })

    const config = (httpBatchLink as Mock).mock.calls[0][0]
    const headers = config.headers()
    expect(headers).toEqual({ 'x-api-key': 'test-api-key' })
  })
  it('wires SSE: uses httpSubscriptionLink for subscription ops', () => {
    const app = { config: { globalProperties: {} } }
    const plugin = createTRPCPlugin({ url: 'https://api.example.com/trpc' })
    plugin.install(app as unknown as App)

    expect(httpSubscriptionLink).toHaveBeenCalledWith({
      url: 'https://api.example.com/trpc',
      transformer: expect.any(Function),
    })
  })
  it('getTRPCClient throws before plugin install', () => {
    expect(() => getTRPCClient()).toThrowError(
      'tRPC client not initialized yet',
    )
  })
})
