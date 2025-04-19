import { useTRPC } from '@/composables/useTRPC'
import { useQuery } from '@tanstack/vue-query'

export const useHelloQuery = (name?: string) => {
  const trpc = useTRPC()
  return useQuery({
    queryKey: ['hello'],
    queryFn: () => trpc.helloWorldRouter.query({ name: name }),
    enabled: false, // avoid auto-fetch
  })
}
