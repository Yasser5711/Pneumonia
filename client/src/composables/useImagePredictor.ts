import { usePredictPneumonia } from '@/queries/usePredictPneumonia'
import { ref } from 'vue'

export const useImagePredictor = () => {
  const selectedFile = ref<File | null>(null)
  const imageUrl = ref('')
  const showResult = ref(false)

  const { mutate: predict, isPending, data, error } = usePredictPneumonia()

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const predictFromFile = async (file: File | File[] | undefined) => {
    const f = Array.isArray(file) ? file[0] : file
    if (!f) return

    selectedFile.value = f
    const base64 = await toBase64(f)
    predict({ imageBase64: base64 })
    showResult.value = true
  }

  const predictFromUrl = async () => {
    if (!imageUrl.value) return

    try {
      const blob = await fetch(imageUrl.value).then(res => res.blob())
      const file = new File([blob], 'remote.jpg', { type: blob.type })
      await predictFromFile(file)
    } catch (err) {
      console.error('Failed to fetch image from URL', err)
    }
  }

  return {
    imageUrl,
    selectedFile,
    predictFromFile,
    predictFromUrl,
    showResult,
    isPending,
    data,
    error,
  }
}
