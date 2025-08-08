import { describe, expect, it, vitest } from 'vitest'

import { renderComposable } from '../tests/renderComposable'
import { MOCK_TRPC } from '../tests/trpc'

import {
  useMeQuery,
  useGenerateKey,
  useGithubCallback,
  useGithubStart,
  useGoogleCallback,
  useGoogleStart,
  useLogout,
} from './useAuth'

import type { AppRouter } from '../plugins/trpc'
import type { TRPCClient } from '@trpc/client'

describe('useGithubStart', () => {
  it('should create github start mutation', () => {
    const [mutation, app] = renderComposable(() => useGithubStart())
    expect(mutation.status.value).toBe('idle')
    expect(mutation.data.value).toBeUndefined()

    app.unmount()
  })

  it('should call github start mutation', async () => {
    const [mutation, app] = renderComposable(() => useGithubStart())

    mutation.mutate()

    await vitest.waitFor(() => {
      expect(mutation.isSuccess.value).toBe(true)
    })

    expect(mutation.data.value).toEqual({
      redirectUrl: 'https://github.com/login/oauth/authorize?client_id=MOCK',
    })

    app.unmount()
  })

  it('should not retry on failure', () => {
    const [mutation, app] = renderComposable(() => useGithubStart())

    expect(mutation.failureCount.value).toBe(0)

    app.unmount()
  })
  it('should handle failure', async () => {
    const trpc = {
      ...MOCK_TRPC,
      auth: {
        ...MOCK_TRPC.auth,
        github: {
          githubStart: {
            mutate: () => {
              return Promise.reject(new Error('GitHub OAuth failed'))
            },
          },
          ...MOCK_TRPC.auth?.github.githubCallback,
        },
      },
    } as unknown as TRPCClient<AppRouter>
    const [mutation, app] = renderComposable(() => useGithubStart(), { trpc })

    mutation.mutate()

    await vitest.waitFor(() => {
      expect(mutation.isError.value).toBe(true)
    })

    expect(mutation.error.value).toEqual(
      expect.objectContaining({
        message: 'GitHub OAuth failed',
      }),
    )
    expect(mutation.data.value).toBeUndefined()

    app.unmount()
  })
})

describe('useGithubCallback', () => {
  it('should create github callback mutation', () => {
    const [mutation, app] = renderComposable(() => useGithubCallback())

    expect(mutation.status.value).toBe('idle')
    expect(mutation.data.value).toBeUndefined()

    app.unmount()
  })

  it('should call github callback mutation with parameters', async () => {
    const [mutation, app] = renderComposable(() => useGithubCallback())

    mutation.mutate({ code: 'test-code', state: 'test-state' })

    await vitest.waitFor(() => {
      expect(mutation.isSuccess.value).toBe(true)
    })

    expect(mutation.data.value).toEqual({
      apiKey: 'ghp_mockedApiKey123',
    })

    app.unmount()
  })

  it('should not retry on failure', () => {
    const [mutation, app] = renderComposable(() => useGithubCallback())

    expect(mutation.failureCount.value).toBe(0)

    app.unmount()
  })
  it('should handle failure', async () => {
    const [mutation, app] = renderComposable(() => useGithubCallback())

    mutation.mutate({ code: 'bad', state: 'test-state' })

    await vitest.waitFor(() => {
      expect(mutation.isError.value).toBe(true)
    })

    expect(mutation.error.value).toEqual(
      expect.objectContaining({
        message: 'GitHub callback failed',
      }),
    )
    expect(mutation.data.value).toBeUndefined()

    app.unmount()
  })
})

describe('useGoogleStart', () => {
  it('should create google start mutation', () => {
    const [mutation, app] = renderComposable(() => useGoogleStart())

    expect(mutation.status.value).toBe('idle')
    expect(mutation.data.value).toBeUndefined()

    app.unmount()
  })

  it('should call google start mutation', async () => {
    const [mutation, app] = renderComposable(() => useGoogleStart())

    mutation.mutate()

    await vitest.waitFor(() => {
      expect(mutation.isSuccess.value).toBe(true)
    })

    expect(mutation.data.value).toEqual({
      redirectUrl: 'https://accounts.google.com/o/oauth2/auth?client_id=MOCK',
    })

    app.unmount()
  })

  it('should not retry on failure', () => {
    const [mutation, app] = renderComposable(() => useGoogleStart())

    expect(mutation.failureCount.value).toBe(0)

    app.unmount()
  })
  it('should handle failure', async () => {
    const trpc = {
      ...MOCK_TRPC,
      auth: {
        ...MOCK_TRPC.auth,
        google: {
          googleStart: {
            mutate: () => {
              return Promise.reject(new Error('Google OAuth failed'))
            },
          },
          ...MOCK_TRPC.auth?.google.googleCallback,
        },
      },
    } as unknown as TRPCClient<AppRouter>
    const [mutation, app] = renderComposable(() => useGoogleStart(), { trpc })

    mutation.mutate()

    await vitest.waitFor(() => {
      expect(mutation.isError.value).toBe(true)
    })

    expect(mutation.error.value).toEqual(
      expect.objectContaining({
        message: 'Google OAuth failed',
      }),
    )
    expect(mutation.data.value).toBeUndefined()

    app.unmount()
  })
})

describe('useGoogleCallback', () => {
  it('should create google callback mutation', () => {
    const [mutation, app] = renderComposable(() => useGoogleCallback())

    expect(mutation.status.value).toBe('idle')
    expect(mutation.data.value).toBeUndefined()

    app.unmount()
  })

  it('should call google callback mutation with parameters', async () => {
    const [mutation, app] = renderComposable(() => useGoogleCallback())

    mutation.mutate({ code: 'test-code', state: 'test-state' })

    await vitest.waitFor(() => {
      expect(mutation.isSuccess.value).toBe(true)
    })

    expect(mutation.data.value).toEqual({
      apiKey: 'ya29.mockedApiKey456',
    })

    app.unmount()
  })

  it('should not retry on failure', () => {
    const [mutation, app] = renderComposable(() => useGoogleCallback())

    expect(mutation.failureCount.value).toBe(0)

    app.unmount()
  })
  it('should handle failure', async () => {
    const [mutation, app] = renderComposable(() => useGoogleCallback())

    mutation.mutate({ code: 'bad', state: 'test-state' })

    await vitest.waitFor(() => {
      expect(mutation.isError.value).toBe(true)
    })

    expect(mutation.error.value).toEqual(
      expect.objectContaining({
        message: 'Google callback failed',
      }),
    )
    expect(mutation.data.value).toBeUndefined()

    app.unmount()
  })
})

describe('useLogout', () => {
  it('should create logout mutation', () => {
    const [mutation, app] = renderComposable(() => useLogout())

    expect(mutation.status.value).toBe('idle')
    expect(mutation.data.value).toBeUndefined()

    app.unmount()
  })

  it('should call logout mutation', async () => {
    const [mutation, app] = renderComposable(() => useLogout())

    mutation.mutate()

    await vitest.waitFor(() => {
      expect(mutation.isSuccess.value).toBe(true)
    })

    expect(mutation.data.value).toEqual({
      success: true,
    })

    app.unmount()
  })

  it('should handle failure', async () => {
    const trpc = {
      ...MOCK_TRPC,
      auth: {
        ...MOCK_TRPC.auth,
        user: {
          ...MOCK_TRPC.auth?.user,
          logout: {
            mutate: () => Promise.reject(new Error('Logout failed')),
          },
        },
      },
    } as unknown as TRPCClient<AppRouter>
    const [mutation, app] = renderComposable(() => useLogout(), { trpc })

    mutation.mutate()

    await vitest.waitFor(() => {
      expect(mutation.isError.value).toBe(true)
    })
    expect(mutation.failureCount.value).toBe(1)
    expect(mutation.error.value).toEqual(
      expect.objectContaining({
        message: 'Logout failed',
      }),
    )
    expect(mutation.data.value).toBeUndefined()

    app.unmount()
  })
})

describe('useGenerateKey', () => {
  it('should create generate key mutation', () => {
    const [mutation, app] = renderComposable(() => useGenerateKey())

    expect(mutation.status.value).toBe('idle')
    expect(mutation.data.value).toBeUndefined()

    app.unmount()
  })

  it('should call generate key mutation', async () => {
    const [mutation, app] = renderComposable(() => useGenerateKey())

    mutation.mutate()

    await vitest.waitFor(() => {
      expect(mutation.isSuccess.value).toBe(true)
    })

    expect(mutation.data.value).toEqual({ apiKey: 'new-user-key-789' })

    app.unmount()
  })
  it('should handle failure', async () => {
    const trpc = {
      ...MOCK_TRPC,
      auth: {
        ...MOCK_TRPC.auth,
        user: {
          ...MOCK_TRPC.auth?.user,
          generateMyKey: {
            mutate: () => Promise.reject(new Error('Key generation failed')),
          },
        },
      },
    } as unknown as TRPCClient<AppRouter>
    const [mutation, app] = renderComposable(() => useGenerateKey(), { trpc })

    mutation.mutate()

    await vitest.waitFor(() => {
      expect(mutation.isError.value).toBe(true)
    })
    expect(mutation.failureCount.value).toBe(1)
    expect(mutation.error.value).toEqual(
      expect.objectContaining({
        message: 'Key generation failed',
      }),
    )
    expect(mutation.data.value).toBeUndefined()

    app.unmount()
  })
})
describe('useMeQuery', () => {
  it('should create me query', () => {
    const [query, app] = renderComposable(() => useMeQuery())

    expect(query.status.value).toBe('pending')
    expect(query.data.value).toBeUndefined()

    app.unmount()
  })

  it('should fetch user data on refetch', async () => {
    const [query, app] = renderComposable(() => useMeQuery())

    await query.refetch()

    await vitest.waitFor(() => {
      expect(query.isSuccess.value).toBe(true)
    })

    expect(query.data.value).toEqual({
      user: {
        id: 'u-1',
        email: 'user@example.com',
        provider: 'guest',
        providerId: 'user@example.com',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        lastLogin: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
        image: null,
      },
      quota: { total: 10, used: 2 },
    })
    app.unmount()
  })
  it('should handle failure', async () => {
    const trpc = {
      ...MOCK_TRPC,
      auth: {
        ...MOCK_TRPC.auth,
        user: {
          ...MOCK_TRPC.auth?.user,
          me: {
            query: () => Promise.reject(new Error('Failed to fetch user data')),
          },
        },
      },
    } as unknown as TRPCClient<AppRouter>
    const [query, app] = renderComposable(() => useMeQuery(), { trpc })

    await query.refetch()

    await vitest.waitFor(() => {
      expect(query.isError.value).toBe(true)
    })

    expect(query.error.value).toEqual(
      expect.objectContaining({
        message: 'Failed to fetch user data',
      }),
    )
    expect(query.data.value).toBeUndefined()

    app.unmount()
  })
})
