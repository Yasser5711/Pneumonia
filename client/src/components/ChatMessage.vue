<script setup lang="ts">
import { CheckCheckIcon, CheckIcon } from "lucide-vue-next";
import { computed, ref } from "vue";
import type { Message } from "../types/chat";
import HoverImage from "./HoverImage.vue";
import ImageModal from "./ImageModal.vue";

const props = defineProps<{
  message: Message;
}>();

const showImageModal = ref(false);

const statusIcon = computed(() => {
  switch (props.message.status) {
    case "sent":
      return CheckIcon;
    case "delivered":
    case "read":
      return CheckCheckIcon;
    default:
      return null;
  }
});

const formattedTime = computed(() => {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(props.message.timestamp);
});
// onMounted(() => {
//   emit("mounted"); // or emit('messageRendered')
// });
</script>

<template>
  <div
    v-motion
    :class="[
      'flex w-full mb-4',
      message.sender === 'user' ? 'justify-end' : 'justify-start',
    ]"
    :initial="{ opacity: 0, y: 20 }"
    :enter="{ opacity: 1, y: 0 }"
  >
    <div
      :class="[
        'max-w-[70%] rounded-2xl px-4 py-2 glass-panel',
        message.sender === 'user'
          ? 'bg-primary/10 rounded-tr-sm'
          : 'bg-surface rounded-tl-sm',
        message.type === 'text' ? 'hover:scale-105' : '',
      ]"
    >
      <template v-if="message.type === 'text'">
        <p class="text-sm md:text-base">
          {{ message.content }}
        </p>
      </template>

      <template v-else-if="message.type === 'image'">
        <HoverImage
          :src="message.url"
          :alt="message.alt"
          class="max-h-[300px] rounded-lg"
          @click="showImageModal = true"
        />
      </template>

      <div class="flex items-center justify-end gap-1 mt-1">
        <span class="text-xs text-text/60">{{ formattedTime }}</span>
        <component
          :is="statusIcon"
          v-if="message.sender === 'user' && statusIcon"
          class="w-4 h-4 text-text/60"
        />
      </div>
    </div>

    <ImageModal
      v-if="message.type === 'image'"
      v-model="showImageModal"
      :src="message.url"
      :alt="message.alt"
    />
  </div>
</template>
