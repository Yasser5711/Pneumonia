<script setup lang="ts">
import { useIntersectionObserver } from "@vueuse/core";
import { EyeIcon } from "lucide-vue-next";
import { ref } from "vue";

defineProps<{
  src: string;
  alt?: string;
  // view?: () => void;
}>();

const imageRef = ref<HTMLImageElement | null>(null);
const isVisible = ref(false);
const isLoaded = ref(false);

// Lazy loading with IntersectionObserver
useIntersectionObserver(imageRef, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    isVisible.value = true;
  }
});

const handleLoad = () => {
  isLoaded.value = true;
};
</script>

<template>
  <div class="relative group cursor-pointer overflow-hidden max-w-full">
    <img
      ref="imageRef"
      :src="isVisible ? src : ''"
      :alt="alt"
      class="transition-all duration-300 object-contain rounded-lg max-w-full max-h-[300px] md:group-hover:blur-sm md:group-hover:scale-105"
      :class="{ 'opacity-0': !isLoaded }"
      @load="handleLoad"
    >

    <div
      class="absolute inset-0 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 bg-black/20"
    >
      <EyeIcon class="w-8 h-8 text-white drop-shadow-lg" />
    </div>
  </div>
</template>
