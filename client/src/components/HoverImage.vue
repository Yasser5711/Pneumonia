<script setup lang="ts">
import { ref, watch } from 'vue'

import { useIntersectionObserver } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  src: string
  alt?: string
}>()
const { t } = useI18n()
const imageContainerRef = ref<HTMLDivElement | null>(null)
const isVisible = ref(false)
const isLoading = ref(true)
const hasError = ref(false)

const { stop: stopObserver } = useIntersectionObserver(
  imageContainerRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      isVisible.value = true
      stopObserver()
    }
  },
  { rootMargin: '100px' },
)

const handleLoad = () => {
  isLoading.value = false
  hasError.value = false
}

const handleError = () => {
  isLoading.value = false
  hasError.value = true
}

watch(
  () => props.src,
  (newSrc) => {
    if (newSrc && isVisible.value) {
      isLoading.value = true
      hasError.value = false
    } else if (!newSrc) {
      isLoading.value = false
      hasError.value = true
    }
  },
)

watch(
  isVisible,
  (becomesVisible) => {
    if (becomesVisible && props.src && !props.src.startsWith('data:')) {
      isLoading.value = true
      hasError.value = false
    } else if (becomesVisible && props.src.startsWith('data:')) {
      isLoading.value = false
      hasError.value = false
    }
  },
  { immediate: false },
)
</script>

<template>
  <div
    ref="imageContainerRef"
    class="group/image relative h-full w-full cursor-pointer overflow-hidden rounded-lg"
    :class="[
      (isLoading || hasError) && !isVisible ? 'bg-transparent' : '',
      (isLoading || hasError) && isVisible
        ? 'bg-slate-500/10 dark:bg-slate-400/10'
        : '',
    ]"
  >
    <div
      v-if="isVisible && isLoading && !hasError"
      class="absolute inset-0 flex animate-pulse items-center justify-center rounded-lg bg-slate-300/20 dark:bg-slate-700/30"
    >
      <v-icon
        icon="mdi-loading"
        class="h-8 w-8 animate-spin text-slate-400/70 dark:text-slate-500/70"
      />
    </div>

    <div
      v-if="isVisible && hasError"
      class="absolute inset-0 flex flex-col items-center justify-center p-2 text-center text-slate-500 dark:text-slate-400"
    >
      <v-icon icon="mdi-image-off-outline" class="mb-1 h-10 w-10 opacity-60" />
      <span class="text-xs">{{ t('HoverImage.unavailable') }}</span>
    </div>

    <img
      v-if="isVisible && !hasError"
      :src="props.src"
      :alt="props.alt || t('HoverImage.alt')"
      class="h-full w-full object-cover transition-all duration-300 ease-in-out"
      :class="{
        'scale-95 opacity-0': isLoading,
        'scale-100 opacity-100': !isLoading && !hasError,
        'group-hover/image:scale-[1.03] group-hover/image:blur-sm group-hover/image:brightness-90 group-hover/image:filter dark:group-hover/image:brightness-90':
          !hasError && !isLoading,
      }"
      @load="handleLoad"
      @error="handleError"
    />
  </div>
</template>
