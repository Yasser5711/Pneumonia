import { trpc } from '@/plugins/trpc'
import { useQuery } from '@tanstack/vue-query'

export const useHelloQuery = () =>
  useQuery({
    queryKey: ['hello'],
    queryFn: () => trpc.helloWorldRouter.query({ name: 'Test' }),
    enabled: false, // avoid auto-fetch
  })
