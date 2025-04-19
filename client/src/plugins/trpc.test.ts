import { httpBatchLink } from '@trpc/client'
import { describe, expect, it, vi, type Mock } from 'vitest'
import type { App } from 'vue'
import { createTRPCPlugin } from './trpc'

vi.mock('@trpc/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@trpc/client')>()
  return {
    ...actual,
    createTRPCClient: vi.fn().mockReturnValue('mockedClient'),
    httpBatchLink: vi.fn().mockReturnValue(() => {}),
  }
})

describe('createTRPCPlugin', () => {
  it('injects a tRPC client with correct config into Vue app', () => {
    const app = { config: { globalProperties: {} } }
    const plugin = createTRPCPlugin({
      apiKey: 'test-api-key',
      url: 'https://api.example.com/trpc',
    })

    plugin.install(app as unknown as App)
    // @ts-expect-error: $trpc is mocked in test
    expect(app.config.globalProperties.$trpc).toBe('mockedClient')

    expect(httpBatchLink).toHaveBeenCalledWith({
      url: 'https://api.example.com/trpc',
      headers: expect.any(Function),
    })

    const config = (httpBatchLink as Mock).mock.calls[0][0]
    const headers = config.headers()
    expect(headers).toEqual({ 'x-api-key': 'test-api-key' })
  })
})
