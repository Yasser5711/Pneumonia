<script setup lang="ts">
import { ImagePlus, SendIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'
import { useImagePredictor } from '../composables/useImagePredictor'
import { useChatStore } from '../stores/chatStore'
import ImagePreview from './ImagePreview.vue'
const chatStore = useChatStore()
const { isTyping } = storeToRefs(chatStore)
const messageInput = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const pendingImage = ref<File | null>(null)
const dragOver = ref(false)
const uploadProgress = ref(0)

const handlePaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file && isValidImage(file)) {
        pendingImage.value = file
        break
      }
    }
  }
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  dragOver.value = false

  const file = e.dataTransfer?.files[0]
  if (file && isValidImage(file)) {
    pendingImage.value = file
  }
}

const handleFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file && isValidImage(file)) {
    pendingImage.value = file
  }
}

const isValidImage = (file: File) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  return validTypes.includes(file.type)
}

const removePendingImage = () => {
  pendingImage.value = null
  uploadProgress.value = 0
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const { predictFromFile, error } = useImagePredictor()
const sendMessage = () => {
  const file = pendingImage.value
  const text = messageInput.value.trim()

  if (file) {
    chatStore.setLoading(true)

    const reader = new FileReader()

    // 💡 Listen to actual file reading progress
    reader.onprogress = (event: ProgressEvent<FileReader>) => {
      if (event.lengthComputable) {
        uploadProgress.value = Math.round((event.loaded / event.total) * 100)
      }
    }

    reader.onload = async (e) => {
      const base64 = e.target?.result as string

      // push user image into chat
      chatStore.addMessage({
        type: 'image',
        url: base64,
        alt: file.name,
        sender: 'user',
      })
      removePendingImage()
      try {
        chatStore.setTyping(true)
        const prediction = await predictFromFile(file)
        if (!prediction) {
          throw new Error('No prediction received')
        }
        chatStore.addMessage({
          type: 'text',
          content: `🩺 I've analyzed the image, and it appears to show **${prediction.label}**, with a confidence of **${(prediction.probability_pneumonia * 100).toFixed(2)}%**.`,
          sender: 'assistant',
        })
      } catch {
        chatStore.addMessage({
          type: 'text',
          content: `❌ Failed to predict: ${error.value?.message ?? 'Unknown error'}`,
          sender: 'assistant',
        })
      } finally {
        chatStore.setTyping(false)
        chatStore.setLoading(false)
      }
    }

    reader.onerror = () => {
      chatStore.addMessage({
        type: 'text',
        content: `❌ Error reading image.`,
        sender: 'assistant',
      })
      chatStore.setLoading(false)
      removePendingImage()
    }

    reader.readAsDataURL(file)
  } else if (text) {
    chatStore.addMessage({
      type: 'text',
      content: text,
      sender: 'user',
    })
    messageInput.value = ''
  }
}

onMounted(() => {
  document.addEventListener('paste', handlePaste)
})

onUnmounted(() => {
  document.removeEventListener('paste', handlePaste)
})
</script>

<template>
  <div
    class="space-y-4"
    @dragover.prevent="dragOver = true"
    @dragleave.prevent="dragOver = false"
    @drop="handleDrop"
  >
    <ImagePreview
      v-if="pendingImage"
      v-motion
      :file="pendingImage"
      :progress="uploadProgress"
      :on-remove="removePendingImage"
      :initial="{ scale: 0.8, opacity: 0 }"
      :enter="{ scale: 1, opacity: 1 }"
      :exit="{ scale: 0.8, opacity: 0 }"
    />

    <div
      :class="[
        'glass-panel flex items-center gap-2 rounded-full p-2',
        dragOver && 'ring-2 ring-primary',
      ]"
    >
      <input
        v-model="messageInput"
        type="text"
        placeholder="Type a message..."
        class="placeholder:text-text/50 flex-1 border-none bg-transparent px-4 text-text outline-none"
        :disabled="!!pendingImage"
        @keyup.enter="!isTyping ? sendMessage() : null"
      />

      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="handleFileSelect"
      />

      <div class="group relative hidden md:block">
        <button
          class="hover:bg-primary/20 group rounded-full p-2 transition-colors"
          :disabled="!!pendingImage"
          @click="() => fileInput?.click()"
        >
          <template v-if="pendingImage">
            <!-- 3 Dots Loader -->
            <div class="flex h-5 w-5 items-center justify-center gap-1">
              <span
                class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]"
              />
              <span
                class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]"
              />
              <span
                class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]"
              />
            </div>
          </template>
          <template v-else>
            <ImagePlus
              class="h-5 w-5 text-text transition-all group-hover:scale-110 group-hover:opacity-70"
            />
          </template>
        </button>
        <!-- Tooltip -->
        <div
          class="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded bg-surface px-2 py-1 text-xs text-text opacity-0 transition-opacity group-hover:opacity-100"
        >
          Upload Image
        </div>
      </div>

      <!-- ✉️ Send Icon OR Spinner -->
      <div class="group relative hidden md:block">
        <button
          class="hover:bg-primary/20 group rounded-full p-2 transition-colors"
          :disabled="(!messageInput.trim() && !pendingImage) || isTyping"
          @click="sendMessage"
        >
          <template v-if="isTyping">
            <!-- 3 Dots Loader -->
            <div class="flex h-5 w-5 items-center justify-center gap-1">
              <span
                class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]"
              />
              <span
                class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]"
              />
              <span
                class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]"
              />
            </div>
          </template>
          <template v-else>
            <SendIcon
              class="h-5 w-5 text-text transition-all"
              :class="[
                (!messageInput.trim() && !pendingImage) || isTyping
                  ? 'cursor-not-allowed opacity-40'
                  : 'group-hover:scale-110 group-hover:opacity-70',
              ]"
            />
          </template>
        </button>
        <!-- Tooltip -->
        <div
          class="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded bg-surface px-2 py-1 text-xs text-text opacity-0 transition-opacity group-hover:opacity-100"
        >
          Send Message
        </div>
      </div>
    </div>
  </div>
</template>
<style>
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-3px);
  }
}

.animate-bounce {
  animation: bounce 0.8s infinite ease-in-out;
}
</style>
