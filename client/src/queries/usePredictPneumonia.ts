import { useTRPC } from '@/composables/useTRPC'
import type { RouterInputs } from '@server/router/_app'
import { useMutation } from '@tanstack/vue-query'
type PredictInput = RouterInputs['predictPneumonia']

export const usePredictPneumonia = () => {
  const trpc = useTRPC()
  return useMutation({
    mutationFn: (data: PredictInput) => trpc.predictPneumonia.mutate(data),
    mutationKey: ['predictPneumonia'],
  })
}
