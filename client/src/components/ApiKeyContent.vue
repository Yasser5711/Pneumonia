<script setup>
import { useClipboard, useTimeoutFn } from '@vueuse/core'
import { useDisplay } from 'vuetify'

import { useGenerateKeyHandler } from '@/composables/useAuthHandler'
import { useSession } from '@/composables/useSession'

import { useApiKeyModal } from './useApiKeyModal'
import { useProfileModal } from './useProfileModal'
const copied = ref(false)
const { closeModal, isOpen } = useApiKeyModal()
const store = useStorageStore()
const { isLoggedIn, refreshMe, user } = useSession()
const { openModal: openProfileModal } = useProfileModal()
const { generateKey, isPending: isGenerating } = useGenerateKeyHandler()
const { copy: copyToClipboard, isSupported } = useClipboard()
const { smAndDown } = useDisplay()

const apiKey = computed(
  () => store.getKeyFromLocalStorage('apiKey').value || '',
)

async function handleCopy() {
  if (!isSupported || !apiKey.value) return
  try {
    await copyToClipboard(String(apiKey.value))
    copied.value = true
    useTimeoutFn(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

function openProfile() {
  closeModal()
  openProfileModal()
}

function generateAPIKey() {
  generateKey(undefined, {
    onSuccess: ({ apiKey }) => {
      store.setKeyInLocalStorage('apiKey', apiKey)
      //   closeModal()
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
  <v-card :title="isLoggedIn ? 'Your API Key' : 'Enter your API Key'">
    <template v-if="isLoggedIn">
      <v-card-text>
        <v-text-field
          v-model="apiKey"
          label="API Key"
          variant="underlined"
          readonly
          :hint="`Quota: ${user?.quota?.used} / ${user?.quota?.total}`"
          persistent-hint
          :append-inner-icon="copied ? 'mdi-check' : 'mdi-content-copy'"
          @click:append-inner="handleCopy"
        />
      </v-card-text>
      <v-card-actions
        class="d-flex gap-2"
        :class="smAndDown ? 'flex-column' : 'flex-row'"
      >
        <v-btn
          color="primary"
          variant="plain"
          :loading="isGenerating"
          @click="generateAPIKey"
          >🔄 Generate new key</v-btn
        >
        <v-spacer />
        <LogoutButton />

        <v-btn
          text="Profile"
          prepend-icon="mdi-account-circle"
          @click="openProfile"
        >
        </v-btn>
      </v-card-actions>
    </template>
  </v-card>
</template>
