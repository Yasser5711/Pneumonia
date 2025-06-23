// src/composables/useGitHubLogin.ts
import { useMutation } from '@tanstack/vue-query'
import { apiFetch } from '../lib/apiFetch'

export function useGitHubLogin() {
  return useMutation({
    mutationFn: () =>
      apiFetch<{ redirectUrl: string }>('/api/auth/github/login', {
        method: 'GET',
      }),
    onSuccess: ({ redirectUrl }) => (window.location.href = redirectUrl),
    retry: false,
  })
}
