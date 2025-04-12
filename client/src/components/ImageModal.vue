<script setup lang="ts">
import { XIcon } from "lucide-vue-next";
import { VueFinalModal } from "vue-final-modal";

defineProps<{
  modelValue: boolean;
  src: string;
  alt?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const close = () => emit("update:modelValue", false);
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
      class="absolute -top-4 -right-4 z-10 p-2 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-opacity opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
      @click="close"
    >
      <XIcon class="w-6 h-6" />
    </button>

    <!-- Image Centered -->
    <div class="flex items-center justify-center w-full h-full">
      <img
        :src="src"
        :alt="alt"
        class="rounded-lg object-contain max-w-full max-h-[90vh]"
      >
    </div>
  </VueFinalModal>
</template>
