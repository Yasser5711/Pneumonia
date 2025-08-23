<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { useFileUploadModal } from './useFileUploadModal'
const { isFileUploadModalOpen, closeModal } = useFileUploadModal()
const files = ref<File>()
const { t } = useI18n()
const emit = defineEmits<{
  (e: 'file-selected', file: File): void
}>()
watch(files, (newFiles) => {
  if (newFiles) {
    const selectedFile = newFiles
    emit('file-selected', selectedFile)
    closeModal()
    files.value = undefined
  }
})
</script>
<template>
  <v-dialog v-model="isFileUploadModalOpen" max-width="600px">
    <v-card>
      <v-file-upload
        v-model="files"
        :label="t('FileInput.label')"
        density="comfortable"
        variant="comfortable"
        :multiple="false"
      ></v-file-upload>
    </v-card>
  </v-dialog>
</template>
