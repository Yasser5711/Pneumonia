<script setup lang="ts">
import { ArrowDownIcon } from 'lucide-vue-next'

defineProps<{
  onClick: () => void
  show: boolean
}>()
</script>

<template>
  <Transition name="fade">
    <button
      v-if="show"
      class="glass-panel hover:bg-primary/20 fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full p-2 shadow-lg transition-all"
      @click="onClick"
    >
      <ArrowDownIcon class="h-5 w-5" />
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
