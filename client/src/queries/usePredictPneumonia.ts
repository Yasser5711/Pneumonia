import { useTRPC } from '@/composables/useTRPC'
import { useMutation } from '@tanstack/vue-query'

export const usePredictPneumonia = () => {
  const trpc = useTRPC()
  return useMutation({
    mutationFn: (data: { imageBase64: string }) =>
      trpc.predictPneumonia.mutate(data),
  })
}
