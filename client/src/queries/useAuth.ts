import { useTRPC } from '@/composables/useTRPC'
import { useQuery } from '@tanstack/vue-query'

export const useGithubStart = () => {
  const trpc = useTRPC()
  return useQuery({
    queryKey: ['githubStart'],
    queryFn: () => trpc.auth.github.githubStart.query({}),
    enabled: false, // avoid auto-fetch
  })
}
export const useGithubCallback = (code: string, state: string) => {
  const trpc = useTRPC()
  return useQuery({
    queryKey: ['githubCallback', code, state],
    queryFn: () => trpc.auth.github.githubCallback.mutate({ code, state }),
    enabled: false, // avoid auto-fetch
  })
}
