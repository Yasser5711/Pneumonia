<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{
  file: File
  progress?: number // Assuming 0-100, undefined if not uploading/no progress
  onRemove: () => void
}>()

const imageUrl = ref<string>('')
const isLoading = ref(true)
const hasLoadError = ref(false) // For FileReader errors or non-image files

const reader = new FileReader()

reader.onload = (e) => {
  imageUrl.value = e.target?.result as string
  isLoading.value = false
  hasLoadError.value = false
}

reader.onerror = () => {
  isLoading.value = false
  hasLoadError.value = true
  imageUrl.value = '' // Clear any potentially stale URL
}

// Initialize loading based on file type
if (props.file && props.file.type.startsWith('image/')) {
  reader.readAsDataURL(props.file)
} else {
  // If not an image file or file is missing, immediately set to error/non-preview state
  isLoading.value = false
  hasLoadError.value = true
}

onBeforeUnmount(() => {
  // Abort FileReader if it's still reading when the component is unmounted
  if (reader.readyState === FileReader.LOADING) {
    reader.abort()
  }
  // If URL.createObjectURL was used, this is where you'd call URL.revokeObjectURL(imageUrl.value)
  // But for Data URLs (base64 from readAsDataURL), explicit revocation is not needed.
})

const isUploading = computed(
  () =>
    typeof props.progress === 'number' &&
    props.progress >= 0 &&
    props.progress < 100,
)
</script>

<template>
  <div class="group relative h-24 w-24 overflow-hidden rounded-lg shadow-lg">
    <div
      v-if="isLoading"
      class="flex h-full w-full animate-pulse items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700"
    >
      <v-icon
        icon="mdi-image-outline"
        class="h-10 w-10 text-slate-400 dark:text-slate-500"
      />
    </div>

    <div
      v-else-if="hasLoadError"
      class="flex h-full w-full flex-col items-center justify-center rounded-lg bg-red-100 p-2 text-center dark:bg-red-900/30"
    >
      <v-icon
        icon="mdi-alert-circle-outline"
        class="mb-1 h-8 w-8 text-red-600 dark:text-red-400"
      />
      <span class="text-xs font-medium text-red-700 dark:text-red-300"
        >Preview N/A</span
      >
    </div>

    <div v-else class="relative h-full w-full">
      <img
        :src="imageUrl"
        :alt="file.name"
        class="h-full w-full object-cover transition-all duration-200"
        :class="{
          'opacity-40 blur-[2px] grayscale-[20%] filter': isUploading, // Visuals during upload
        }"
      />

      <div
        v-if="isUploading"
        class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/20 dark:bg-black/40"
      >
        <div class="flex flex-col items-center gap-1 text-center">
          <v-icon
            icon="mdi-loading"
            class="h-7 w-7 animate-spin text-white drop-shadow-md"
          />
          <span
            v-if="typeof props.progress === 'number'"
            class="text-xs font-semibold text-white drop-shadow-md"
          >
            {{ Math.round(props.progress) }}%
          </span>
        </div>
      </div>

      <button
        v-if="!isLoading && !hasLoadError"
        type="button"
        title="Remove image"
        class="absolute top-1.5 right-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white/80 shadow-lg transition-all duration-150 ease-in-out hover:scale-110 hover:bg-red-600 hover:text-white focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none"
        @click="props.onRemove"
      >
        <span class="sr-only">Remove {{ file.name }}</span>
        <v-icon icon="mdi-close" class="h-5 w-5" />
      </button>
    </div>
  </div>
</template>
