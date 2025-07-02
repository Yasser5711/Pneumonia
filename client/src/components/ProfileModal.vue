<script setup lang="ts">
import { computed } from 'vue'

import { useDateFormat } from '@vueuse/core' // pour dates lisibles

import { useSession } from '@/composables/useSession'

import { useProfileModal } from './useProfileModal'

const { isProfileOpen, closeModal } = useProfileModal()
const { user } = useSession()

// 🧠 Avatar GitHub (ou null fallback)
const avatarUrl = computed(() => {
  const id = user.value?.providerId
  return user.value?.provider === 'github' && id
    ? `https://avatars.githubusercontent.com/u/${id}?s=128`
    : null
})

// 🧠 Progression de quota (entre 0 et 100)
const quotaPct = computed(() => {
  const q = user.value?.quota
  return q ? Math.round((q.used / q.left) * 100) : 0
})

// 🧠 Dates formattées lisiblement
const createdAt = computed(() =>
  user.value?.createdAt
    ? useDateFormat(user.value.createdAt, 'YYYY-MM-DD HH:mm').value
    : '—',
)
const lastLogin = computed(() =>
  user.value?.lastLogin
    ? useDateFormat(user.value.lastLogin, 'YYYY-MM-DD HH:mm').value
    : '—',
)
</script>

<template>
  <v-dialog v-model="isProfileOpen" max-width="460" scrollable>
    <!-- ───────────── Logged In ───────────── -->
    <v-card v-if="user" elevation="2" class="rounded-lg">
      <v-card-title class="text-h6">Your profile</v-card-title>

      <v-card-text>
        <!-- Avatar + Email -->
        <v-row no-gutters align="center" class="mb-4">
          <v-avatar v-if="avatarUrl" size="56" class="me-3">
            <v-img :src="avatarUrl" alt="GitHub avatar" />
          </v-avatar>

          <div>
            <div class="text-h6">{{ user.email }}</div>
            <v-chip
              v-if="user.provider"
              size="small"
              variant="outlined"
              class="mt-1"
            >
              {{ user.provider }}
            </v-chip>
          </div>
        </v-row>

        <v-divider />

        <!-- Données de l'utilisateur -->
        <v-list density="compact">
          <v-list-item title="User ID" :subtitle="user.id" />
          <v-list-item
            v-if="user.providerId"
            title="Provider ID"
            :subtitle="user.providerId"
          />
          <v-list-item title="Created" :subtitle="createdAt" />
          <v-list-item title="Last login" :subtitle="lastLogin" />
        </v-list>

        <!-- Quota -->
        <template v-if="user.quota">
          <v-divider class="my-3" />
          <div class="text-body-2 font-weight-medium mb-2">
            Quota: {{ user.quota.used }} /
            {{ user.quota.left }}
          </div>
          <v-progress-linear
            :model-value="quotaPct"
            height="8"
            rounded
            color="primary"
          />
        </template>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="flat" color="primary" @click="closeModal">Close</v-btn>
      </v-card-actions>
    </v-card>

    <!-- ───────────── Logged Out ───────────── -->
    <v-card v-else elevation="2" class="rounded-lg">
      <v-card-title class="text-h6">Not logged in</v-card-title>
      <v-card-text>Please login first.</v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="flat" color="primary" @click="closeModal">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
