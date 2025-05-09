import { ref } from 'vue'

const isOpen = ref(false)

export function useApiKeyModal() {
  function openModal() {
    isOpen.value = true
  }

  function closeModal() {
    isOpen.value = false
  }

  return {
    isOpen,
    openModal,
    closeModal,
  }
}
