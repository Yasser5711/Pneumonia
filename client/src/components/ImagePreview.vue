<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{
  file: File
  progress?: number
  onRemove: () => void
}>()

const imageUrl = ref<string>('')
const isLoading = ref(true)
const hasLoadError = ref(false)

const reader = new FileReader()

reader.onload = (e) => {
  imageUrl.value = e.target?.result as string
  isLoading.value = false
  hasLoadError.value = false
}

reader.onerror = () => {
  isLoading.value = false
  hasLoadError.value = true
  imageUrl.value = ''
}

if (props.file) {
  if (props.file.type.startsWith('image/')) {
    reader.readAsDataURL(props.file)
  } else {
    isLoading.value = false
    hasLoadError.value = true
  }
} else {
  isLoading.value = false
  hasLoadError.value = true
}

onBeforeUnmount(() => {
  if (reader.readyState === FileReader.LOADING) {
    reader.abort()
  }
})

const isUploading = computed(
  () =>
    typeof props.progress === 'number' &&
    props.progress >= 0 &&
    props.progress < 100,
)
</script>

<template>
  <v-card
    :width="96"
    :height="96"
    rounded="lg"
    elevation="2"
    class="image-preview-card"
  >
    <div
      v-if="isLoading"
      class="d-flex align-center fill-height bg-surface-variant justify-center"
    >
      <v-progress-circular
        indeterminate
        color="grey-lighten-1"
        size="32"
        width="3"
      />
    </div>

    <div
      v-else-if="hasLoadError"
      class="d-flex flex-column align-center fill-height pa-2 bg-error-container justify-center text-center"
    >
      <v-icon
        icon="mdi-alert-circle-outline"
        size="32"
        color="on-error-container"
        class="mb-1"
      />
      <span class="text-caption font-weight-medium text-on-error-container">
        Preview N/A
      </span>
    </div>

    <div v-else class="image-display-container fill-height">
      <v-img
        :src="imageUrl"
        :alt="file.name"
        height="100%"
        width="100%"
        cover
        class="image-preview-img"
        :style="
          isUploading
            ? { opacity: 0.35, filter: 'blur(1.5px) grayscale(40%)' }
            : {}
        "
      />

      <v-overlay
        :model-value="isUploading"
        contained
        persistent
        scrim="rgba(0,0,0,0.35)"
        class="d-flex align-center justify-center"
      >
        <div class="d-flex flex-column align-center text-center">
          <v-progress-circular
            indeterminate
            color="white"
            size="28"
            width="3"
            class="mb-1"
          />
          <span
            v-if="typeof props.progress === 'number'"
            class="text-caption text-white"
            style="font-weight: 600; text-shadow: 0 0 3px rgb(0 0 0 / 70%)"
          >
            {{ Math.round(props.progress) }}%
          </span>
        </div>
      </v-overlay>

      <v-btn
        icon
        size="x-small"
        title="Remove image"
        aria-label="Remove image"
        class="remove-button"
        @click="props.onRemove"
      >
        <v-icon icon="mdi-close" size="18" />
      </v-btn>
    </div>
  </v-card>
</template>

<style scoped>
.image-preview-card {
  position: relative;
  overflow: hidden;
}

.image-display-container {
  position: relative;
}

.image-preview-img .v-img__img {
  transition:
    opacity 0.25s ease-in-out,
    filter 0.25s ease-in-out;
}

.image-preview-img.v-img {
  transition:
    opacity 0.25s ease-in-out,
    filter 0.25s ease-in-out;
}

.remove-button {
  position: absolute !important;
  top: 6px;
  right: 6px;
  z-index: 10;
  background-color: rgb(0 0 0 / 45%) !important;
  color: rgb(255 255 255 / 85%) !important;
  border-radius: 50%;
  transition:
    background-color 0.15s ease-in-out,
    transform 0.15s ease-in-out,
    color 0.15s ease-in-out;
}
</style>
