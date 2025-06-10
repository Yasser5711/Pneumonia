import { useEventListener } from '@vueuse/core'
import { ref } from 'vue'

// État et compteur au niveau du module pour assurer un comportement singleton
const isDraggingFileOverWindow = ref(false)
let dragEnterCounter = 0
let listenersAttached = false // Pour s'assurer que les écouteurs ne sont attachés qu'une fois

export function useGlobalFileDragState() {
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
    ) // Utiliser la phase de capture pour intercepter tôt

    useEventListener(
      window,
      'dragover',
      (event: DragEvent) => {
        if (event.dataTransfer?.types.includes('Files')) {
          event.preventDefault() // Nécessaire pour permettre le 'drop'
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
          // La prévention du comportement par défaut du 'drop' est généralement gérée
          // par la zone de dépôt spécifique qui reçoit le fichier.
          // Ici, nous réinitialisons surtout l'état visuel global.
          dragEnterCounter = 0
          isDraggingFileOverWindow.value = false
        }
      },
      true,
    )

    listenersAttached = true
  }

  return {
    isDraggingFileOverWindow,
  }
}
