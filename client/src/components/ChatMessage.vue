<script setup lang="ts">
import { computed, ref } from 'vue'

import { CheckCheckIcon, CheckIcon } from 'lucide-vue-next'

import HoverImage from './HoverImage.vue'
import ImageModal from './ImageModal.vue'

import type { Message } from '../types/chat'

const props = defineProps<{
  message: Message
}>()

const showImageModal = ref(false)
const isUserSender = computed(() => props.message.sender === 'user')

const statusIcon = computed(() => {
  if (!isUserSender.value) return null
  switch (props.message.status) {
    case 'sent':
      return CheckIcon
    case 'delivered':
    case 'read':
      return CheckCheckIcon
    default:
      return null
  }
})

const formattedTime = computed(() => {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(props.message.timestamp)
})
</script>

<template>
  <div
    v-motion
    :class="[
      'group mb-4 flex w-full',
      isUserSender ? 'justify-end' : 'justify-start',
    ]"
    :initial="{ opacity: 0, y: 15 }"
    :enter="{
      opacity: 1,
      y: 0,
      transition: { duration: 350, ease: 'easeOut' },
    }"
  >
    <div
      :class="[
        'max-w-[75%] rounded-2xl px-4 py-2 md:max-w-[65%]',
        'backdrop-blur-lg',
        isUserSender
          ? message.type == 'text'
            ? 'mr-1 rounded-tr-sm bg-blue-100/50 dark:bg-blue-800/40'
            : 'mr-1 rounded-tr-sm'
          : 'ml-1 rounded-tl-sm border-slate-300/50 bg-slate-200/50 dark:border-slate-600/50 dark:bg-slate-700/40',
      ]"
    >
      <div class="px-3.5 py-2 sm:px-4 sm:py-2.5">
        <!-- <div v-if="!isUserSender" class="mb-1.5 flex items-center">
          <v-icon icon="mdi-robot" size="small"></v-icon>
          <span class="ml-1 text-xs font-semibold">Assistant</span>
        </div> -->
        <template v-if="message.type === 'text'">
          <p class="text-sm leading-relaxed break-words sm:text-base">
            {{ message.content }}
          </p>
        </template>

        <template v-else-if="message.type === 'image'">
          <div
            class="my-1.5 aspect-square w-full max-w-[240px] cursor-pointer overflow-hidden rounded-lg shadow-sm sm:max-w-[260px] md:max-w-[280px]"
            @click="showImageModal = true"
          >
            <HoverImage
              :src="message.url"
              :alt="message.alt || 'Chat image'"
              class="h-full w-full"
            />
          </div>
        </template>

        <div
          class="mt-1.5 flex items-center gap-1.5"
          :class="[isUserSender ? 'justify-end' : 'justify-start']"
        >
          <span class="text-xs text-slate-500 dark:text-slate-400">
            {{ formattedTime }}
          </span>
          <component
            :is="statusIcon"
            v-if="isUserSender && statusIcon"
            :class="[
              'h-4 w-4',
              message.status === 'read'
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-slate-500 opacity-80 dark:text-slate-400',
            ]"
          />
        </div>
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
