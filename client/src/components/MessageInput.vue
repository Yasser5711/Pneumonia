<script setup lang="ts">
import { ImagePlus, SendIcon } from "lucide-vue-next";
import { storeToRefs } from "pinia";
import { onMounted, onUnmounted, ref } from "vue";
import { useChatStore } from "../stores/chatStore";
import ImagePreview from "./ImagePreview.vue";
const chatStore = useChatStore();
const { isTyping } = storeToRefs(chatStore);
const messageInput = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const pendingImage = ref<File | null>(null);
const dragOver = ref(false);
const uploadProgress = ref(0);

const handlePaste =  (e: ClipboardEvent) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file && isValidImage(file)) {
        pendingImage.value = file;
        break;
      }
    }
  }
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  dragOver.value = false;

  const file = e.dataTransfer?.files[0];
  if (file && isValidImage(file)) {
    pendingImage.value = file;
  }
};

const handleFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file && isValidImage(file)) {
    pendingImage.value = file;
  }
};

const isValidImage = (file: File) => {
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  return validTypes.includes(file.type);
};

const removePendingImage = () => {
  pendingImage.value = null;
  uploadProgress.value = 0;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const simulateUploadProgress = () => {
  uploadProgress.value = 0;
  const interval = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += Math.random() * 30;
    }
    if (uploadProgress.value >= 90) {
      clearInterval(interval);
    }
  }, 200);
  return interval;
};

const sendMessage =  () => {
  if (pendingImage.value) {
    const progressInterval = simulateUploadProgress();
    const reader = new FileReader();
    reader.onload = (e) => {
      // Simulate network delay
      setTimeout(() => {
        uploadProgress.value = 100;
        chatStore.addMessage({
          type: "image",
          url: e.target?.result as string,
          alt: pendingImage.value?.name,
          sender: "user",
        });
        clearInterval(progressInterval);
        removePendingImage();
      }, 500);
    };
    reader.readAsDataURL(pendingImage.value);
  } else {
    const content = messageInput.value.trim();
    if (!content) return;

    chatStore.addMessage({
      type: "text",
      content,
      sender: "user",
    });

    messageInput.value = "";
  }
};

onMounted(() => {
  document.addEventListener("paste", handlePaste);
});

onUnmounted(() => {
  document.removeEventListener("paste", handlePaste);
});
</script>

<template>
  <div
    class="space-y-4"
    @dragover.prevent="dragOver = true"
    @dragleave.prevent="dragOver = false"
    @drop="handleDrop"
  >
    <ImagePreview
      v-if="pendingImage"
      v-motion
      :file="pendingImage"
      :progress="uploadProgress"
      :on-remove="removePendingImage"
      :initial="{ scale: 0.8, opacity: 0 }"
      :enter="{ scale: 1, opacity: 1 }"
      :exit="{ scale: 0.8, opacity: 0 }"
    />

    <div
      :class="[
        'glass-panel rounded-full p-2 flex items-center gap-2',
        dragOver && 'ring-2 ring-primary',
      ]"
    >
      <input
        v-model="messageInput"
        type="text"
        placeholder="Type a message..."
        class="flex-1 bg-transparent border-none outline-none px-4 text-text placeholder:text-text/50"
        :disabled="!!pendingImage"
        @keyup.enter="!isTyping ? sendMessage() : null"
      >

      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="handleFileSelect"
      >

      <div class="relative group hidden md:block">
        <button
          class="p-2 rounded-full hover:bg-primary/20 transition-colors group"
          :disabled="!!pendingImage"
          @click="() => fileInput?.click()"
        >
          <template v-if="pendingImage">
            <!-- 3 Dots Loader -->
            <div class="flex gap-1 items-center justify-center w-5 h-5">
              <span
                class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0ms]"
              />
              <span
                class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:150ms]"
              />
              <span
                class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:300ms]"
              />
            </div>
          </template>
          <template v-else>
            <ImagePlus
              class="w-5 h-5 text-text transition-all group-hover:opacity-70 group-hover:scale-110"
            />
          </template>
        </button>
        <!-- Tooltip -->
        <div
          class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded bg-surface text-text opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        >
          Upload Image
        </div>
      </div>

      <!-- ✉️ Send Icon OR Spinner -->
      <div class="relative group hidden md:block">
        <button
          class="p-2 rounded-full hover:bg-primary/20 transition-colors group"
          :disabled="(!messageInput.trim() && !pendingImage) || isTyping"
          @click="sendMessage"
        >
          <template v-if="isTyping">
            <!-- 3 Dots Loader -->
            <div class="flex gap-1 items-center justify-center w-5 h-5">
              <span
                class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0ms]"
              />
              <span
                class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:150ms]"
              />
              <span
                class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:300ms]"
              />
            </div>
          </template>
          <template v-else>
            <SendIcon
              class="w-5 h-5 text-text transition-all"
              :class="[
                (!messageInput.trim() && !pendingImage) || isTyping
                  ? 'opacity-40 cursor-not-allowed'
                  : 'group-hover:opacity-70 group-hover:scale-110',
              ]"
            />
          </template>
        </button>
        <!-- Tooltip -->
        <div
          class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded bg-surface text-text opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        >
          Send Message
        </div>
      </div>
    </div>
  </div>
</template>
<style>
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.animate-bounce {
  animation: bounce 0.8s infinite ease-in-out;
}
</style>
