<script setup lang="ts">
import ChatWindow from "../components/ChatWindow.vue";
import { useTheme } from "../composables/useTheme";

const {  themeMode, cycleTheme } = useTheme();
</script>

<template>
  <div class="bg-background transition-colors duration-300">
    <button
      class="absolute top-4 right-4 z-50 p-2 glass-panel rounded-full hover:bg-primary/20 transition-colors hover:scale-105"
      @click="cycleTheme"
    >
      <span v-if="themeMode === 'light'">🌙</span>
      <span v-else-if="themeMode === 'dark'">☀️</span>
      <span v-else>💻</span>
    </button>

    <ChatWindow />
  </div>
</template>
