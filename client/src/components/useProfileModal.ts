const isProfileOpen = ref(false)

export function useProfileModal() {
  const openModal = () => (isProfileOpen.value = true)
  const closeModal = () => (isProfileOpen.value = false)
  return { isProfileOpen, openModal, closeModal }
}
