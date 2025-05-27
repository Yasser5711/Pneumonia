<script setup lang="ts">
// Removed lucide-vue-next imports
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref, watch } from 'vue' // Added watch
import { useImagePredictor } from '../composables/useImagePredictor' // Assuming path is correct
import { useChatStore } from '../stores/chatStore' // Assuming path is correct
import ImagePreview from './ImagePreview.vue' // Assuming path is correct

const chatStore = useChatStore()
const { isTyping } = storeToRefs(chatStore) // isTyping likely means assistant is processing/replying

const messageInput = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const pendingImage = ref<File | null>(null)
const dragOver = ref(false)
const localReadProgress = ref(0) // Renamed for clarity, as it's FileReader progress

// Reset progress when pendingImage changes to null or a new file
watch(pendingImage, (newFile, oldFile) => {
  if (!newFile || (newFile && oldFile && newFile !== oldFile)) {
    localReadProgress.value = 0
  }
})

const handlePaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items
  if (!items) return

  // Prioritize image already selected via input/drag-drop
  if (pendingImage.value) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file && isValidImage(file)) {
        pendingImage.value = file
        break // Use the first valid image found
      }
    }
  }
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  dragOver.value = false
  if (pendingImage.value) return // Don't override if already one selected and not yet sent

  const file = e.dataTransfer?.files[0]
  if (file && isValidImage(file)) {
    pendingImage.value = file
  } else if (file) {
    // Optional: Feedback for invalid file type on drop
    // chatStore.addMessage({ type: 'text', content: 'Invalid file type. Please use JPEG, PNG, or WEBP.', sender: 'system' })
    console.warn('Invalid file type dropped:', file.type)
  }
}

const handleFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file && isValidImage(file)) {
    pendingImage.value = file
  } else if (file) {
    // Optional: Feedback for invalid file type on select
    console.warn('Invalid file type selected:', file.type)
    if (fileInput.value) fileInput.value.value = '' // Clear invalid selection
  }
}

const isValidImage = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5 MB limit (example)
  if (!validTypes.includes(file.type)) {
    console.warn(
      `Invalid file type: ${file.type}. Valid types are: ${validTypes.join(', ')}`,
    )
    return false
  }
  if (file.size > maxSize) {
    console.warn(
      `File size exceeds ${maxSize / (1024 * 1024)}MB limit: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    )
    // Potentially show a user-facing message here
    // chatStore.addMessage({ type: 'text', content: `Image size should not exceed ${maxSize / (1024*1024)}MB.`, sender: 'system' })
    return false
  }
  return true
}

const removePendingImage = () => {
  pendingImage.value = null
  // localReadProgress is reset by the watcher on pendingImage
  if (fileInput.value) {
    fileInput.value.value = '' // Clear the file input
  }
}

const { predictFromFile, error: predictionError } = useImagePredictor() // Renamed error for clarity

const sendMessage = () => {
  const currentFile = pendingImage.value
  const text = messageInput.value.trim()

  if (currentFile) {
    chatStore.setLoading(true) // Indicates overall processing for the image
    localReadProgress.value = 0 // Ensure progress starts from 0 for this read

    const reader = new FileReader()

    reader.onprogress = (event: ProgressEvent<FileReader>) => {
      if (event.lengthComputable) {
        localReadProgress.value = Math.round((event.loaded / event.total) * 100)
      }
    }

    reader.onload = async () => {
      const base64 = reader.result as string
      chatStore.addMessage({
        type: 'image',
        url: base64,
        alt: currentFile.name,
        sender: 'user',
      })
      // Image is "sent" from user's perspective once it appears in chat.
      // The prediction is an async follow-up.
      const imageFileForPrediction = currentFile // Capture file ref
      removePendingImage() // Clear preview immediately after adding to chat

      try {
        chatStore.setTyping(true) // Assistant starts "thinking" about the prediction
        const prediction = await predictFromFile(imageFileForPrediction)
        if (!prediction) {
          throw new Error('No prediction received from the model.')
        }
        chatStore.addMessage({
          type: 'text',
          content: `🩺 I've analyzed the image "${imageFileForPrediction.name}", and it appears to show **${prediction.label}**, with a confidence of **${(prediction.probability_pneumonia * 100).toFixed(2)}%**.`,
          sender: 'assistant',
        })
      } catch {
        // console.error('Prediction error:', err)
        // const message = predictionError.value?.message || (err instanceof Error ? err.message : 'Unknown prediction error');
        chatStore.addMessage({
          type: 'text',
          content: `❌ Failed to analyze image:`,
          sender: 'assistant',
        })
      } finally {
        chatStore.setTyping(false)
        chatStore.setLoading(false)
      }
    }

    reader.onerror = () => {
      console.error('FileReader error for:', currentFile.name)
      chatStore.addMessage({
        type: 'text',
        content: `❌ Error reading image file. Please try again.`,
        sender: 'assistant', // Or 'system'
      })
      chatStore.setLoading(false)
      removePendingImage()
    }

    reader.readAsDataURL(currentFile)
  } else if (text) {
    chatStore.addMessage({
      type: 'text',
      content: text,
      sender: 'user', // Added status
    })
    messageInput.value = ''
    // chatStore.setTyping(true) // If assistant should reply to text too
    // Call assistant for text messages if needed here
  }
}

const triggerFileInput = () => {
  if (pendingImage.value) return // Don't open if image already pending
  fileInput.value?.click()
}

// Document-level paste listener (common for chat apps for image pasting)
onMounted(() => {
  document.addEventListener('paste', handlePaste)
})

onUnmounted(() => {
  document.removeEventListener('paste', handlePaste)
})

// Computed property for send button disabled state for clarity
const isSendDisabled = computed(() => {
  return (
    (!messageInput.value.trim() && !pendingImage.value) || chatStore.isTyping
  ) // Using chatStore.isTyping for assistant busy
})

// Computed property for upload button disabled state
const isUploadDisabled = computed(() => !!pendingImage.value)
</script>

<template>
  <div
    class="w-full space-y-3 p-2 sm:p-3"
    @dragover.prevent="dragOver = true"
    @dragleave.prevent="dragOver = false"
    @drop="handleDrop"
  >
    <ImagePreview
      v-if="pendingImage"
      v-motion
      :file="pendingImage"
      :progress="localReadProgress"
      :on-remove="removePendingImage"
      class="mx-auto"
      :initial="{ scale: 0.85, opacity: 0, y: 10 }"
      :enter="{
        scale: 1,
        opacity: 1,
        y: 0,
        transition: { duration: 300, ease: 'easeOut' },
      }"
      :exit="{
        scale: 0.85,
        opacity: 0,
        y: 10,
        transition: { duration: 200, ease: 'easeIn' },
      }"
    />

    <div
      :class="[
        'flex items-center gap-1.5 rounded-full p-1.5 shadow-lg transition-all duration-200 sm:gap-2 sm:p-2',
        'border border-slate-300/50 bg-white/70 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/70', // Glassmorphism
        dragOver && !pendingImage
          ? 'scale-[1.01] ring-2 ring-blue-500 dark:ring-blue-400'
          : 'ring-0',
        pendingImage
          ? 'focus-within:ring-2 focus-within:ring-slate-500 dark:focus-within:ring-slate-400'
          : 'focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400',
      ]"
    >
      <input
        v-model="messageInput"
        type="text"
        placeholder="Type a message or drop an image..."
        class="flex-1 border-none bg-transparent px-2.5 py-1.5 text-sm text-slate-800 outline-none placeholder:text-slate-500 focus:ring-0 sm:px-4 sm:text-base dark:text-slate-100 dark:placeholder:text-slate-400"
        :disabled="isUploadDisabled"
        @keyup.enter="!isSendDisabled ? sendMessage() : null"
      />

      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        :disabled="isUploadDisabled"
        @change="handleFileSelect"
      />

      <div class="group relative">
        <button
          type="button"
          :title="pendingImage ? 'Image selected for sending' : 'Upload Image'"
          class="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:h-10 sm:w-10 dark:text-slate-300 dark:focus:ring-offset-slate-800"
          :class="{
            'cursor-not-allowed': isUploadDisabled,
            'hover:bg-blue-500/10 dark:hover:bg-blue-400/10': !isUploadDisabled,
          }"
          :disabled="isUploadDisabled"
          @click="triggerFileInput"
        >
          <template
            v-if="
              pendingImage && localReadProgress < 100 && localReadProgress > 0
            "
          >
            <div class="flex h-5 w-5 items-center justify-center gap-1">
              <span
                class="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:0ms] dark:bg-blue-400"
              />
              <span
                class="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:150ms] dark:bg-blue-400"
              />
              <span
                class="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:300ms] dark:bg-blue-400"
              />
            </div>
          </template>
          <template v-else>
            <v-icon
              icon="mdi-paperclip"
              class="h-5 w-5 transition-transform duration-200 sm:h-6 sm:w-6"
              :class="
                !isUploadDisabled ? 'group-hover:scale-110' : 'opacity-50'
              "
            />
          </template>
        </button>
        <div
          v-if="!pendingImage"
          class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 rounded-md bg-slate-700 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-slate-900"
        >
          Attach Image
        </div>
      </div>

      <div class="group relative">
        <button
          type="button"
          title="Send Message"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm transition-all duration-200 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:h-10 sm:w-10 dark:focus:ring-offset-slate-800"
          :class="{
            'cursor-not-allowed opacity-60 hover:bg-blue-500': isSendDisabled,
            'hover:scale-105 active:scale-95': !isSendDisabled,
          }"
          :disabled="isSendDisabled"
          @click="sendMessage"
        >
          <template v-if="isTyping">
            <div class="flex h-5 w-5 items-center justify-center gap-1">
              <span
                class="h-1.5 w-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:0ms]"
              />
              <span
                class="h-1.5 w-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:150ms]"
              />
              <span
                class="h-1.5 w-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:300ms]"
              />
            </div>
          </template>
          <template v-else>
            <v-icon
              icon="mdi-send"
              class="h-5 w-5 transition-transform duration-200 sm:h-6 sm:w-6"
              :class="!isSendDisabled ? 'group-hover:translate-x-0.5' : ''"
            />
          </template>
        </button>
        <div
          v-if="!isTyping"
          class="pointer-events-none absolute right-0 bottom-full z-10 mb-1.5 rounded-md bg-slate-700 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-slate-900"
        >
          Send
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Changed to scoped to ensure custom bounce doesn't leak */
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* The animate-bounce class will use this custom keyframe */
.animate-bounce {
  animation: bounce 0.8s infinite ease-in-out;
}
</style>
