<script setup lang="ts">
import {
  useImagePredictor,
  type PredictionResult,
} from '@/composables/useImagePredictor'
import { useHelloQuery } from '@/queries/useHelloQuery'
import { ref } from 'vue'

const showHelloResult = ref(false)
const showResult = ref(false)
const data = ref(<PredictionResult | null>null)
const { imageUrl, predictFromFile, predictFromUrl, isPending, error } =
  useImagePredictor()
const handleUpload = async (file: File | File[]) => {
  try {
    const prediction = await predictFromFile(file)
    data.value = prediction ?? null
    showResult.value = true
  } catch {
    console.error('Error during prediction:', error)
  }
}

const {
  data: helloData,
  isLoading: isHelloLoading,
  isError: isHelloError,
  refetch,
} = useHelloQuery()
</script>

<template>
  <v-container class="pa-4">
    <!-- Hello Query -->
    <v-card class="pa-4 mb-6" elevation="2">
      <v-card-title class="text-h6">
        👋 Hello from tRPC + Vuetify
      </v-card-title>
      <v-card-text>
        <v-btn
          color="secondary"
          :loading="isHelloLoading"
          :disabled="isHelloLoading"
          @click="refetch().then(() => (showHelloResult = true))"
        >
          🔍 Test tRPC Query
        </v-btn>

        <v-alert v-if="isHelloLoading" type="info" class="mt-4" border="start">
          ⏳ Fetching hello...
        </v-alert>

        <v-alert
          v-else-if="isHelloError"
          type="error"
          class="mt-4"
          border="start"
        >
          ❌ Something went wrong while fetching the hello query.
        </v-alert>

        <v-alert
          v-else-if="showHelloResult && helloData"
          type="success"
          class="mt-4"
          border="start"
        >
          ✅ Server says: <strong>{{ helloData }}</strong>
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Pneumonia Prediction -->
    <v-card class="pa-4" elevation="2">
      <v-card-title class="text-h6"> 🩻 Predict Pneumonia </v-card-title>

      <v-card-text>
        <v-file-input
          label="Upload chest X-ray"
          accept="image/*"
          prepend-icon="mdi-upload"
          :disabled="isPending"
          :loading="isPending"
          :multiple="false"
          @update:model-value="handleUpload"
        />

        <v-text-field
          v-model="imageUrl"
          label="Paste image URL"
          prepend-icon="mdi-link"
          class="mt-4"
          :disabled="isPending"
        />
        <v-btn
          class="mt-2"
          :disabled="!imageUrl || isPending"
          color="primary"
          @click="predictFromUrl"
        >
          🔗 Predict from URL
        </v-btn>

        <v-alert v-if="isPending" type="info" class="mt-4" border="start">
          ⏳ Predicting...
        </v-alert>

        <v-alert
          v-else-if="showResult && data"
          type="success"
          class="mt-4"
          border="start"
        >
          🩺 Prediction: <strong>{{ data?.label }}</strong
          ><br />
          📊 Confidence:
          <strong>{{ (data.probability_pneumonia * 100).toFixed(2) }}%</strong>
        </v-alert>

        <v-alert
          v-else-if="showResult && error"
          type="error"
          class="mt-4"
          border="start"
        >
          ❌ Error: {{ error.message }}
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>
