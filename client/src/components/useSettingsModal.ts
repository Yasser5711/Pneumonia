const isSettingsOpen = ref(false)

export function useSettingsModal() {
  const openModal = () => (isSettingsOpen.value = true)
  const closeModal = () => (isSettingsOpen.value = false)
  return { isSettingsOpen, openModal, closeModal }
}
