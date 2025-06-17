import { useEventListener } from '@vueuse/core'
import { ref } from 'vue'
import { useFileUploadModal } from '../components/useFileUploadModal'
const isDraggingFileOverWindow = ref(false)
let dragEnterCounter = 0
let listenersAttached = false

export function useGlobalFileDragState() {
  const { openModal } = useFileUploadModal()
  if (!listenersAttached) {
    useEventListener(
      window,
      'dragenter',
      (event: DragEvent) => {
        // Vérifier si des fichiers sont glissés
        if (event.dataTransfer?.types.includes('Files')) {
          event.preventDefault()
          dragEnterCounter++
          isDraggingFileOverWindow.value = true
        }
      },
      true,
    )

    useEventListener(
      window,
      'dragover',
      (event: DragEvent) => {
        if (event.dataTransfer?.types.includes('Files')) {
          event.preventDefault()
        }
      },
      true,
    )

    useEventListener(
      window,
      'dragleave',
      (event: DragEvent) => {
        if (event.dataTransfer?.types.includes('Files')) {
          dragEnterCounter--
          if (dragEnterCounter === 0) {
            isDraggingFileOverWindow.value = false
          }
        }
      },
      true,
    )

    useEventListener(
      window,
      'drop',
      (event: DragEvent) => {
        if (event.dataTransfer?.types.includes('Files')) {
          dragEnterCounter = 0
          isDraggingFileOverWindow.value = false
        }
      },
      true,
    )

    listenersAttached = true
    watch(isDraggingFileOverWindow, (newValue) => {
      if (newValue) {
        openModal()
      }
    })
  }

  return {
    isDraggingFileOverWindow,
  }
}
