<script setup lang="ts">
import { XIcon } from 'lucide-vue-next'
import { ref } from 'vue'

const props = defineProps<{
  file: File
  progress?: number
  onRemove: () => void
}>()

const imageUrl = ref<string>('')
const isLoading = ref(true)

// Create preview URL
const reader = new FileReader()
reader.onload = (e) => {
  imageUrl.value = e.target?.result as string
  isLoading.value = false
}
reader.readAsDataURL(props.file)
</script>

<template>
  <div class="group relative h-24 w-24">
    <!-- Preview while loading -->
    <div
      v-if="isLoading"
      class="h-full w-full animate-pulse rounded-lg bg-surface"
    />

    <!-- Final image -->
    <div v-else class="relative h-full w-full">
      <img
        :src="imageUrl"
        :alt="file.name"
        class="h-full w-full rounded-lg border border-white/20 object-cover"
        :class="{
          'opacity-50 blur-[2px]': progress !== undefined && progress < 100,
        }"
      />

      <!-- Centered Loader Overlay -->
      <div
        v-if="progress !== undefined && progress < 100"
        class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
      >
        <div class="flex flex-col items-center gap-1">
          <svg class="h-6 w-6 animate-spin text-primary" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span class="text-xs font-medium text-primary">
            {{ Math.round(progress) }}%
          </span>
        </div>
      </div>

      <!-- Top-right Close Button (not stretching the row) -->
      <button
        class="absolute right-1 top-1 rounded-full bg-surface p-1.5 shadow-lg"
        @click="onRemove"
      >
        <XIcon class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
