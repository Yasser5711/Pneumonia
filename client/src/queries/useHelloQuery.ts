import { useTRPC } from '@/composables/useTRPC'
import { useQuery } from '@tanstack/vue-query'

export const useHelloQuery = () => {
  const trpc = useTRPC()
  return useQuery({
    queryKey: ['hello'],
    queryFn: () => trpc.helloWorldRouter.query({ name: 'Test' }),
    enabled: false, // avoid auto-fetch
  })
}
