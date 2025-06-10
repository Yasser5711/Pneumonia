<script setup lang="ts">
defineProps<{
  onClick: () => void
  show: boolean
}>()
</script>

<template>
  <Transition name="fade-slide-fast">
    <button
      v-if="show"
      type="button"
      title="Scroll to bottom"
      aria-label="Scroll to bottom"
      class="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] left-1/2 z-40 flex h-10 w-10 items-center justify-center rounded-full shadow-xl transition-all duration-150 ease-out hover:scale-105 active:scale-95 sm:bottom-[calc(env(safe-area-inset-bottom,0px)+6rem)] sm:h-11 sm:w-11"
      :class="[
        'border border-slate-300/70 bg-white/80 backdrop-blur-md dark:border-slate-600/70 dark:bg-slate-700/80',
        'text-slate-600 hover:border-blue-500/50 hover:text-blue-600 dark:text-slate-200 dark:hover:border-blue-500/50 dark:hover:text-blue-400',
      ]"
      @click="onClick"
    >
      <v-icon icon="mdi-arrow-down" class="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
  </Transition>
</template>

<style scoped>
.fade-slide-fast-enter-active,
.fade-slide-fast-leave-active {
  transition:
    opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-fast-enter-from,
.fade-slide-fast-leave-to {
  opacity: 0;
  transform: translateY(15px) scale(0.95);
}
</style>
