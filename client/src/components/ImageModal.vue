<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  src?: string
  alt?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const loading = ref(true)
const showFallback = ref(false)

watch(
  () => props.src,
  () => {
    loading.value = true
    showFallback.value = false
  },
)
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1000px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card elevation="1" color="transparent" rounded="lg">
      <v-img
        v-if="!showFallback"
        :src="src"
        :alt="alt"
        @load="loading = false"
        @error="showFallback = true"
      >
        <template #placeholder>
          <div class="d-flex align-center fill-height justify-center">
            <v-progress-circular color="primary" indeterminate :width="4" />
          </div>
        </template>

        <template #error>
          <div class="d-flex align-center fill-height justify-center">
            <v-img
              :aspect-ratio="16 / 9"
              src="https://dummyimage.com/1600x900/000000/ffffff&text=Image+Not+Available"
              @load="loading = false"
            />
          </div>
        </template>
      </v-img>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
