<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { storeToRefs } from 'pinia'

import {
  useFileUpload,
  type FileUploadResult,
} from '../composables/useFileUpload'
import { useGlobalFileDragState } from '../composables/useGlobalFileDragState' // Importez le nouveau composable
import { useImagePredictor } from '../composables/useImagePredictor'
import { useChatStore } from '../stores/chatStore'

import ImagePreview from './ImagePreview.vue'

const { predictFromFile, error: predictionError } = useImagePredictor()

const chatStore = useChatStore()
const { isTyping: assistantIsProcessing } = storeToRefs(chatStore)

const {
  uploadProgress,
  isUploadingFile,
  processUploadedFile,
  resetFileUpload,
} = useFileUpload()

const { isDraggingFileOverWindow } = useGlobalFileDragState()

const messageInput = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const pendingImageFile = ref<File | null>(null)
const processedImageData = ref<FileUploadResult | null>(null)
// dragOver local n'est plus nécessaire pour le style principal du v-sheet,
// mais peut être utile si vous avez des logiques spécifiques lorsque la souris passe EXACTEMENT sur le v-sheet.
// Pour cet objectif, nous allons le supprimer pour simplifier et utiliser directement isDraggingFileOverWindow.
// const dragOver = ref(false)
const isSendingInternally = ref(false)

// --- Gestion de la sélection et du traitement initial du fichier ---
const processNewFile = async (file: File) => {
  if (!isValidImage(file)) {
    if (fileInput.value) fileInput.value.value = ''
    pendingImageFile.value = null
    console.warn("Tentative de traitement d'un fichier invalide:", file.type)
    return
  }

  pendingImageFile.value = file
  processedImageData.value = null
  resetFileUpload()

  try {
    const result = await processUploadedFile(file)
    processedImageData.value = result
  } catch (err) {
    console.error('Erreur lors du traitement initial du fichier:', err)
  }
}

watch(pendingImageFile, (newFile, oldFile) => {
  if (!newFile || (newFile && oldFile && newFile !== oldFile)) {
    resetFileUpload()
    processedImageData.value = null
    if (fileInput.value) fileInput.value.value = ''
  }
})

const handlePaste = (e: ClipboardEvent) => {
  if (isActionDisabledForNewFile.value && !isDraggingFileOverWindow.value)
    return // Modifié pour permettre le paste si global drag
  const items = e.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        processNewFile(file)
        break
      }
    }
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processNewFile(file)
  }
}

const isValidImage = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5 MB
  if (!validTypes.includes(file.type)) {
    chatStore.addMessage({
      type: 'text',
      content: `Type de fichier invalide : ${file.type}. Types valides : ${validTypes.join(', ')}`,
      sender: 'assistant',
    })
    return false
  }
  if (file.size > maxSize) {
    chatStore.addMessage({
      type: 'text',
      content: `La taille du fichier dépasse la limite de ${maxSize / (1024 * 1024)}MB.`,
      sender: 'assistant',
    })
    return false
  }
  return true
}

const removePendingImage = () => {
  pendingImageFile.value = null
}

const sendMessage = async () => {
  if (isSendDisabled.value) return

  const currentProcessedImage = processedImageData.value
  const text = messageInput.value.trim()

  isSendingInternally.value = true
  chatStore.setLoading(true)

  if (currentProcessedImage && pendingImageFile.value) {
    chatStore.addMessage({
      type: 'image',
      url: currentProcessedImage.base64Data,
      alt: currentProcessedImage.file.name,
      sender: 'user',
    })

    const imageFileForPrediction = currentProcessedImage.file
    removePendingImage()
    messageInput.value = ''

    chatStore.setTyping(true)
    try {
      const prediction = await predictFromFile(imageFileForPrediction)
      if (!prediction) throw new Error('Aucune prédiction reçue.')
      // chatStore.addMessage({
      //   type: 'prediction',
      //   sender: 'assistant',
      //   originalImageName: imageFileForPrediction.name,
      //   prediction: prediction.prediction,
      //   heatmapUrl: prediction.heatmap_base64,
      // })
      chatStore.addMessage({
        type: 'text',
        content: `🩺 J'ai analysé l'image "${imageFileForPrediction.name}", et elle semble montrer **${prediction.prediction.class}**, avec une confiance de **${(prediction.prediction.probability * 100).toFixed(2)}%**.`,
        sender: 'assistant',
      })
      if (prediction.heatmap_base64)
        chatStore.addMessage({
          type: 'image',
          url: prediction.heatmap_base64 || '',
          alt: `Heatmap de la prédiction pour ${imageFileForPrediction.name}`,
          sender: 'assistant',
        })
    } catch (predictionErr) {
      chatStore.addMessage({
        type: 'text',
        content: `❌ Échec de l'analyse de l'image : ${predictionErr instanceof Error ? predictionErr.message : 'Erreur inconnue'}`,
        sender: 'assistant',
      })
    } finally {
      chatStore.setTyping(false)
    }
  } else if (text) {
    chatStore.addMessage({ type: 'text', content: text, sender: 'user' })
    messageInput.value = ''
  }

  chatStore.setLoading(false)
  isSendingInternally.value = false
}

const triggerFileInput = () => {
  if (isActionDisabledForNewFile.value) return
  fileInput.value?.click()
}

onMounted(() => {
  // Les écouteurs globaux de drag/drop sont gérés par useGlobalFileDragState
  // L'écouteur de paste reste local
  document.addEventListener('paste', handlePaste)
})

onUnmounted(() => {
  document.removeEventListener('paste', handlePaste)
})

const isActionDisabledForNewFile = computed(() => {
  return (
    !!pendingImageFile.value ||
    assistantIsProcessing.value ||
    isUploadingFile.value
  )
})

const isSendDisabled = computed(() => {
  if (assistantIsProcessing.value || isSendingInternally.value) return true

  const hasText = messageInput.value.trim().length > 0
  const imageSelectedAndProcessing =
    pendingImageFile.value &&
    (isUploadingFile.value || !processedImageData.value)
  const imageSelectedAndReady =
    pendingImageFile.value && processedImageData.value && !isUploadingFile.value

  if (imageSelectedAndProcessing) return true
  if (imageSelectedAndReady) return false
  if (hasText) return false
  return true
})

const showSendButtonLoader = computed(() => {
  return isSendingInternally.value || assistantIsProcessing.value
})

const uploadButtonIcon = computed(() => {
  if (pendingImageFile.value && processedImageData.value)
    return 'mdi-image-check'
  if (pendingImageFile.value && isUploadingFile.value)
    return 'mdi-cloud-upload-outline'
  return 'mdi-paperclip'
})

const textFieldPlaceholder = computed(() => {
  if (pendingImageFile.value && isUploadingFile.value) {
    return "Lecture de l'image en cours..."
  }
  if (pendingImageFile.value && processedImageData.value)
    return `Image "${pendingImageFile.value.name}" prête. Ajoutez un message ou envoyez.`
  if (isDraggingFileOverWindow.value && !isActionDisabledForNewFile.value)
    return "Déposez l'image ici !" // Nouveau placeholder quand on drag globalement
  if (assistantIsProcessing.value)
    return "L'assistant est en train de répondre..."
  return 'Écrivez un message ou déposez une image...'
})

const isTextFieldDisabled = computed(() => {
  return (
    (pendingImageFile.value && isUploadingFile.value) ||
    assistantIsProcessing.value ||
    (isDraggingFileOverWindow.value && !isActionDisabledForNewFile.value)
  )
})
</script>

<template>
  <FileInput @file-selected="processNewFile" />
  <div class="chat-input-area pa-2 pa-sm-4">
    <ImagePreview
      v-if="pendingImageFile"
      v-motion
      :file="pendingImageFile"
      :progress="uploadProgress"
      :on-remove="removePendingImage"
      class="mx-auto mb-3"
      :initial="{ scale: 0.9, opacity: 0, y: 8 }"
      :enter="{
        scale: 1,
        opacity: 1,
        y: 0,
        transition: { duration: 300, ease: 'easeOut' },
      }"
      :exit="{
        scale: 0.9,
        opacity: 0,
        y: 8,
        transition: { duration: 200, ease: 'easeIn' },
      }"
    />

    <v-sheet
      :elevation="2"
      :border="'md'"
      :class="[
        'd-flex align-start ga-2 pa-1 pa-sm-2 transition-swing rounded-xl',
      ]"
      style="
        transition:
          box-shadow 0.2s ease-out,
          border-color 0.2s ease-out,
          background-color 0.2s ease-out;
      "
    >
      <v-text-field
        v-model="messageInput"
        :placeholder="textFieldPlaceholder"
        variant="solo"
        flat
        hide-details
        class="flex-grow-1"
        :disabled="isTextFieldDisabled"
        autofocus
        @keyup.enter.exact.prevent="!isSendDisabled ? sendMessage() : null"
      />

      <div class="d-flex flex-column align-center justify-center pt-1">
        <v-btn
          icon
          variant="text"
          title="Téléverser une image"
          :disabled="isActionDisabledForNewFile"
          @click="triggerFileInput"
        >
          <v-progress-circular
            v-if="pendingImageFile && isUploadingFile"
            indeterminate
            size="24"
            width="2"
            color="primary"
          ></v-progress-circular>
          <v-icon v-else :icon="uploadButtonIcon" size="large"></v-icon>
        </v-btn>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="d-none"
          @change="handleFileSelect"
        />
      </div>

      <div class="d-flex flex-column align-center justify-center pt-1">
        <v-btn
          icon="mdi-send"
          variant="text"
          title="Envoyer le message"
          :loading="showSendButtonLoader"
          :disabled="isSendDisabled"
          rounded="lg"
          size="default"
          class="px-1"
          @click="sendMessage"
        >
          <template #loader>
            <div
              class="d-flex ga-1 align-center justify-center"
              style="height: 20px; width: 20px"
            >
              <span
                class="dot-xs animate-bounce-custom bg-white"
                style="animation-delay: 0ms"
              ></span>
              <span
                class="dot-xs animate-bounce-custom bg-white"
                style="animation-delay: 150ms"
              ></span>
              <span
                class="dot-xs animate-bounce-custom bg-white"
                style="animation-delay: 300ms"
              ></span>
            </div>
          </template>
        </v-btn>
      </div>
    </v-sheet>
  </div>
</template>

<style scoped>
@keyframes bounce-custom-keyframe {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-3px);
  }
}

.animate-bounce-custom {
  animation: bounce-custom-keyframe 0.8s infinite ease-in-out;
}

.dot-xs {
  height: 0.25rem;
  width: 0.25rem;
  border-radius: 50%;
}
</style>
