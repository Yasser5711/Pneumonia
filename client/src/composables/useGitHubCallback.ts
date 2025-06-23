// src/composables/useGitHubCallback.ts
import { useMutation } from '@tanstack/vue-query'
import { apiFetch } from '../lib/apiFetch'

export function useGitHubCallback() {
  return useMutation({
    mutationFn: ({ code, state }: { code: string; state: string }) =>
      apiFetch<{ apiKey: string }>(
        `/api/auth/github/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
        { method: 'GET' },
      ),
    retry: false,
  })
}
