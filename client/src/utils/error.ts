import { TRPCClientError } from '@trpc/client'

export function parseError(e: unknown): string {
  if (e instanceof TRPCClientError) {
    return e.message || 'Unknown error'
  }
  if (e instanceof Error) {
    return e.message
  }
  try {
    return JSON.stringify(e)
  } catch {
    return 'Unknown error'
  }
}
