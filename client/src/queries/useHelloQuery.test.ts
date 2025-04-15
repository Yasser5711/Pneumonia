import { useHelloQuery } from '@/queries/useHelloQuery'
import { renderComposable } from '@/tests/renderComposable'
import { describe, expect, it, vitest } from 'vitest'

describe('useHelloQuery', () => {
  it('should not auto-fetch when enabled: false', async () => {
    const [query, app] = renderComposable(() => useHelloQuery())

    expect(query.status.value).toBe('pending')
    expect(query.data.value).toBeUndefined()
    expect(query.isSuccess.value).toBe(false)

    app.unmount()
  })

  it('should fetch and return hello message on refetch()', async () => {
    const [query, app] = renderComposable(() => useHelloQuery())
    await query.refetch()
    await vitest.waitFor(() => {
      expect(query.isSuccess.value).toBe(true)
    })
    expect(query.data.value).toEqual({
      message: 'Hello, Guest!',
    })
    app.unmount()
  })
  it('should fetch and return hello message with name', async () => {
    const [query, app] = renderComposable(() => useHelloQuery('John'))
    await query.refetch()
    await vitest.waitFor(() => {
      expect(query.isSuccess.value).toBe(true)
    })
    expect(query.data.value).toEqual({
      message: 'Hello, John!',
    })
    app.unmount()
  })
  it('should return error when query fails', async () => {
    const [query, app] = renderComposable(() => useHelloQuery('error'))
    await query.refetch()
    await vitest.waitFor(() => {
      expect(query.isError.value).toBe(true)
    })
    expect(query.error.value).toEqual(new Error('Failed to fetch hello message'))
    app.unmount()
  })
})
