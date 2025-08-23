import { ref } from 'vue'

import { useI18n } from 'vue-i18n'
export interface FileUploadResult {
  base64Data: string
  file: File
}

export function useFileUpload() {
  const progress = ref(0)
  const isReading = ref(false)
  const error = ref<string | null>(null)
  const { t } = useI18n()

  const processFile = (fileToProcess: File): Promise<FileUploadResult> => {
    return new Promise((resolve, reject) => {
      if (!fileToProcess) {
        const errorMessage = t('fileUpload.noFileProvided')
        error.value = errorMessage
        reject(new Error(errorMessage))
        return
      }

      isReading.value = true
      progress.value = 0
      error.value = null

      const reader = new FileReader()

      reader.onprogress = (event: ProgressEvent<FileReader>) => {
        if (event.lengthComputable) {
          progress.value = Math.round((event.loaded / event.total) * 100)
          // const currentProgress = Math.round((event.loaded / event.total) * 100)
          // progress.value = currentProgress
          // console.log(
          //   `FileReader Progress: ${currentProgress}% (Loaded: ${event.loaded}, Total: ${event.total})`,
          // )
        }
      }

      reader.onload = () => {
        isReading.value = false
        resolve({
          base64Data: reader.result as string,
          file: fileToProcess,
        })
      }

      reader.onerror = () => {
        isReading.value = false
        progress.value = 0
        const errorMessage = `${t('fileUpload.readError', { fileName: fileToProcess.name, error: reader.error?.message })}`
        console.error(errorMessage, reader.error)
        error.value = errorMessage
        reject(new Error(errorMessage))
      }

      reader.readAsDataURL(fileToProcess)
    })
  }

  const reset = () => {
    progress.value = 0
    isReading.value = false
    error.value = null
  }

  return {
    uploadProgress: progress,
    isUploadingFile: isReading,
    uploadError: error,
    processUploadedFile: processFile,
    resetFileUpload: reset,
  }
}
