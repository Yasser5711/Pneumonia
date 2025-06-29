<script setup lang="ts">
import { useSession } from '@/composables/useSession'

import { useProfileModal } from './useProfileModal'

const { isProfileOpen, closeModal } = useProfileModal()
const { user } = useSession()
</script>

<template>
  <v-dialog v-model="isProfileOpen" max-width="460px" scrollable>
    <v-card v-if="user" title="Your profile">
      <v-card-text>
        <v-list density="compact">
          <v-list-item title="Email" :subtitle="user.email" />
          <v-list-item title="Provider" :subtitle="user.provider" />
          <v-list-item title="User ID" :subtitle="user.id" />
          <v-list-item
            v-if="user.keys && user.keys.length"
            title="Keys"
            :subtitle="user.keys.map(k => k.keyPrefix).join(', ')"
          />
        </v-list>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn text="Close" variant="plain" @click="closeModal" />
      </v-card-actions>
    </v-card>
    <v-card v-else title="Not logged in">
      <v-card-text>Please login first.</v-card-text>
      <v-card-actions class="justify-end">
        <v-btn text="Close" variant="plain" @click="closeModal" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
