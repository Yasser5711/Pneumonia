<script setup lang="ts">
import { useStorageStore } from '@/stores/storageStore'
import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'
import { useApiKeyModal } from './useApiKeyModal'

const show = ref(false)
const { isOpen, closeModal } = useApiKeyModal()
const store = useStorageStore()

const schema = z.object({
  apiKey: z.string().nonempty('API key is required'),
})

const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    apiKey: store.getKeyFromLocalStorage('apiKey').value || '',
  },
})

const { value: apiKey, errorMessage } = useField('apiKey')

const submit = handleSubmit((values) => {
  store.setKeyInLocalStorage('apiKey', values.apiKey)
  closeModal()
})

function onClear() {
  resetForm()
  store.removeKeyFromLocalStorage('apiKey')
  apiKey.value = ''
}
</script>

<template>
  <v-dialog v-model="isOpen" persistent max-width="400px">
    <v-card title="Enter your API Key">
      <v-form ref="formRef" @submit.prevent="submit">
        <v-card-text>
          <v-text-field
            v-model="apiKey"
            :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show ? 'text' : 'password'"
            label="API Key"
            :error-messages="errorMessage"
            required
            variant="underlined"
            @click:append="show = !show"
          >
            <template #prepend>
              <span>🔑</span>
            </template>
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text="Clear"
            color="error"
            variant="plain"
            :disabled="!apiKey"
            @click="onClear"
          />
          <v-btn
            text="Submit"
            color="success"
            type="submit"
            variant="plain"
            :disabled="!apiKey"
          />
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
