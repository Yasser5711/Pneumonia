<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'

import { useGenerateKeyHandler } from '@/composables/useAuthHandler'
import { useSession } from '@/composables/useSession'

import { useApiKeyModal } from './useApiKeyModal'
// import { useProfileModal } from './useProfileModal'
const show = ref(false)
const { isOpen, closeModal } = useApiKeyModal()
const store = useStorageStore()
const { isLoggedIn, refreshMe, logout } = useSession()
// const { openModal: openProfileModal } = useProfileModal()
const { generateKey, isPending: isGenerating } = useGenerateKeyHandler()
const router = useRouter()
// const loggedIn = computed(() => !!user.value)
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
function openProfile() {
  closeModal()
  router.push({ path: '/profile' }) // triggers modal via route page
}
function onClear() {
  resetForm()
  store.removeKeyFromLocalStorage('apiKey')
  apiKey.value = ''
}
function generateKey1() {
  generateKey(undefined, {
    onSuccess: ({ apiKey }) => {
      store.setKeyInLocalStorage('apiKey', apiKey)
      closeModal()
    },
    onError: (error) => {
      console.error('Error generating key:', error)
    },
  })
}
watch(isOpen, (open) => {
  if (open && isLoggedIn.value === true) refreshMe()
})
</script>

<template>
  <v-dialog v-model="isOpen" persistent max-width="700px">
    <v-card :title="isLoggedIn ? 'Your API Key' : 'Enter your API Key'">
      <template v-if="isLoggedIn">
        <v-card-text>
          <v-text-field
            v-model="apiKey"
            label="API Key"
            variant="underlined"
            readonly
            hide-details
          />
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="primary"
            variant="plain"
            :loading="isGenerating"
            @click="generateKey1"
            >🔄 Generate new key</v-btn
          >
          <v-spacer />
          <v-btn color="error" variant="plain" @click="logout">🚪 Logout</v-btn>
          <v-btn icon title="Profile" @click="openProfile">
            <v-icon icon="mdi-eye" />
          </v-btn>
        </v-card-actions>
      </template>

      <template v-else>
        <v-form @submit.prevent="submit">
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
              <template #prepend> <span>🔑</span> </template>
            </v-text-field>
          </v-card-text>
          <v-card-actions>
            <LoginButton />
            <v-spacer />
            <v-btn
              color="error"
              variant="plain"
              :disabled="!apiKey"
              @click="onClear"
              >Clear</v-btn
            >
            <v-btn
              type="submit"
              color="success"
              variant="plain"
              :disabled="!apiKey"
              >Submit</v-btn
            >
          </v-card-actions>
        </v-form>
      </template>
    </v-card>
  </v-dialog>
</template>
