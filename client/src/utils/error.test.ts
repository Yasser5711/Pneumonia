import { TRPCClientError } from '@trpc/client'
import { describe, it, expect } from 'vitest'

import { parseError } from '@/utils/error'

describe('parseError', () => {
  it('returns message for TRPCClientError', () => {
    const err = new TRPCClientError('trpc boom')
    expect(parseError(err)).toBe('trpc boom')
  })

  it('returns fallback for TRPCClientError when no message', () => {
    const err = new TRPCClientError('')
    expect(parseError(err)).toBe('Unknown error')
  })

  it('returns message for regular Error', () => {
    const err = new Error('boom')
    expect(parseError(err)).toBe('boom')
  })

  it('stringifies non-error values', () => {
    expect(parseError({ a: 1 })).toBe('{"a":1}')
    expect(parseError('string')).toBe('"string"')
  })

  it('returns "Unknown error" if JSON.stringify fails', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const circular: any = {}
    circular.self = circular
    expect(parseError(circular)).toBe('Unknown error')
  })
})
