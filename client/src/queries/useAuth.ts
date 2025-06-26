import { useTRPC } from '@/composables/useTRPC'
import { useQuery, useMutation } from '@tanstack/vue-query'
import { watch } from 'vue'
export const useGithubStart = () => {
  const trpc = useTRPC()
  return useMutation({
    mutationKey: ['githubStart'],
    mutationFn: () => trpc.auth.github.githubStart.mutate({}),
    retry: false,
  })
}
export const useGithubCallback = () => {
  const trpc = useTRPC()
  return useMutation({
    mutationKey: ['githubCallback'],
    mutationFn: ({ code, state }: { code: string; state: string }) =>
      trpc.auth.github.githubCallback.mutate({ code, state }),
    // onSuccess: ({ ap }) => (window.location.href = redirectUrl),
    retry: false,
  })
}
