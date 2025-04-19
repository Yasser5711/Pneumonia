<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { EyeIcon } from 'lucide-vue-next'
import { ref } from 'vue'

defineProps<{
  src: string
  alt?: string
  // view?: () => void;
}>()

const imageRef = ref<HTMLImageElement | null>(null)
const isVisible = ref(false)
const isLoaded = ref(false)

// Lazy loading with IntersectionObserver
useIntersectionObserver(imageRef, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    isVisible.value = true
  }
})

const handleLoad = () => {
  isLoaded.value = true
}
</script>

<template>
  <div class="group relative max-w-full cursor-pointer overflow-hidden">
    <img
      ref="imageRef"
      :src="isVisible ? src : ''"
      :alt="alt"
      class="max-h-[300px] max-w-full rounded-lg object-contain transition-all duration-300 md:group-hover:scale-105 md:group-hover:blur-sm"
      :class="{ 'opacity-0': !isLoaded }"
      @load="handleLoad"
    />

    <div
      class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 md:group-hover:opacity-100"
    >
      <EyeIcon class="h-8 w-8 text-white drop-shadow-lg" />
    </div>
  </div>
</template>
