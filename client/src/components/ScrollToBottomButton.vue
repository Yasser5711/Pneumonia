<script setup lang="ts">
import { ArrowDownIcon } from "lucide-vue-next";

defineProps<{
  onClick: () => void;
  show: boolean;
}>();
</script>

<template>
  <Transition name="fade">
    <button
      v-if="show"
      class="fixed bottom-24 left-1/2 -translate-x-1/2 glass-panel rounded-full p-2 hover:bg-primary/20 transition-all shadow-lg"
      @click="onClick"
    >
      <ArrowDownIcon class="w-5 h-5" />
    </button>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
