import { trpc } from '@/plugins/trpc'
import { useMutation } from '@tanstack/vue-query'

export const usePredictPneumonia = () => {
  return useMutation({
    mutationFn: (data: { imageBase64: string }) => trpc.predictPneumonia.mutate(data),
  })
}
