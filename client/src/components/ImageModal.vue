<script setup lang="ts">
import { XIcon } from 'lucide-vue-next'
import { VueFinalModal } from 'vue-final-modal'

defineProps<{
  modelValue: boolean
  src: string
  alt?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const close = () => emit('update:modelValue', false)
</script>

<template>
  <VueFinalModal
    :model-value="modelValue"
    class="flex items-center justify-center"
    content-class="bg-transparent shadow-none p-0 max-w-[90vw] max-h-[90vh] rounded-lg relative group"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
    overlay-class="bg-black/40 backdrop-blur-lg"
    lock-scroll
    fit-parent
    click-to-close
    swipe-to-close="up"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- Close Button (outside image) -->
    <button
      class="absolute -right-4 -top-4 z-10 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/70 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
      @click="close"
    >
      <XIcon class="h-6 w-6" />
    </button>

    <!-- Image Centered -->
    <div class="flex h-full w-full items-center justify-center">
      <img
        :src="src"
        :alt="alt"
        class="max-h-[90vh] max-w-full rounded-lg object-contain"
      >
    </div>
  </VueFinalModal>
</template>
