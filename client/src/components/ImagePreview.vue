<script setup lang="ts">
import { XIcon } from "lucide-vue-next";
import { ref } from "vue";

const props = defineProps<{
  file: File;
  progress?: number;
  onRemove: () => void;
}>();

const imageUrl = ref<string>("");
const isLoading = ref(true);

// Create preview URL
const reader = new FileReader();
reader.onload = (e) => {
  imageUrl.value = e.target?.result as string;
  isLoading.value = false;
};
reader.readAsDataURL(props.file);
</script>

<template>
  <div class="relative group w-24 h-24">
    <!-- Preview while loading -->
    <div
      v-if="isLoading"
      class="w-full h-full rounded-lg bg-surface animate-pulse"
    />

    <!-- Final image -->
    <div
      v-else
      class="relative w-full h-full"
    >
      <img
        :src="imageUrl"
        :alt="file.name"
        class="w-full h-full rounded-lg object-cover border border-white/20"
        :class="{
          'blur-[2px] opacity-50': progress !== undefined && progress < 100,
        }"
      >

      <!-- Centered Loader Overlay -->
      <div
        v-if="progress !== undefined && progress < 100"
        class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
      >
        <div class="flex flex-col items-center gap-1">
          <svg
            class="w-6 h-6 text-primary animate-spin"
            viewBox="0 0 24 24"
          >
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
        class="absolute top-1 right-1 p-1.5 rounded-full bg-surface shadow-lg  "
        @click="onRemove"
      >
        <XIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
