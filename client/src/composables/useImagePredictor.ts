import { ref } from 'vue'

import { usePredictPneumonia } from '@/queries/usePredictPneumonia'
export interface PredictionResult {
  prediction: {
    class: string
    probability: number
  }
  heatmap_base64: string | null
}
export const useImagePredictor = () => {
  const selectedFile = ref<File | null>(null)
  const imageUrl = ref('')

  const { mutateAsync: predictAsync, isPending, error } = usePredictPneumonia()

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const predictFromFile = async (file: File | File[]) => {
    const f = Array.isArray(file) ? file[0] : file
    if (!f) return

    selectedFile.value = f
    const base64 = await toBase64(f)
    const result = await predictAsync({ imageBase64: base64 })
    return {
      prediction: result.prediction,
      heatmap_base64: result.heatmap_base64,
    } as PredictionResult
  }

  const predictFromUrl = async () => {
    if (!imageUrl.value) return

    try {
      const blob = await fetch(imageUrl.value).then((res) => res.blob())
      const file = new File([blob], 'remote.jpg', { type: blob.type })
      return await predictFromFile(file)
    } catch (err) {
      console.error('Failed to fetch image from URL', err)
    }
  }

  return {
    imageUrl,
    selectedFile,
    predictFromFile,
    predictFromUrl,
    isPending,
    error,
  }
}
