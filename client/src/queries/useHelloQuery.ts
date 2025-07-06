import { useQuery } from '@tanstack/vue-query'

import { useTRPC } from '@/composables/useTRPC'

export const useHelloQuery = (name?: string) => {
  const trpc = useTRPC()
  return useQuery({
    queryKey: ['hello', name],
    queryFn: () => trpc.helloWorldRouter.query({ name: name }),
    enabled: false, // avoid auto-fetch
  })
}
