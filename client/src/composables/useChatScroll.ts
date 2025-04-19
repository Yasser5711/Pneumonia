import { onMounted, onUnmounted, ref } from 'vue'

export const useChatScroll = () => {
  const showScrollButton = ref(false)
  const isAtBottom = ref(true)

  const checkScroll = () => {
    const scrollTop = window.scrollY //1100
    const scrollHeight = document.documentElement.scrollHeight //2000
    const clientHeight = window.innerHeight //800
    const scrollPosition = scrollHeight - scrollTop - clientHeight

    isAtBottom.value = scrollPosition < 100
    showScrollButton.value = !isAtBottom.value
  }

  const scrollToBottom = (smooth = true) => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    })
  }

  onMounted(() => {
    window.addEventListener('scroll', checkScroll)
    scrollToBottom(false)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', checkScroll)
  })

  return {
    showScrollButton,
    isAtBottom,
    scrollToBottom,
    checkScroll,
  }
}
