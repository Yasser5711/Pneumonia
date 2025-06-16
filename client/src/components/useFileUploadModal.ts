import { ref } from 'vue'

const isFileUploadModalOpen = ref(false)

export function useFileUploadModal() {
  function openModal() {
    isFileUploadModalOpen.value = true
  }

  function closeModal() {
    isFileUploadModalOpen.value = false
  }

  return {
    isFileUploadModalOpen,
    openModal,
    closeModal,
  }
}
