<script setup lang="ts">
import { computed } from 'vue'

import { useDateFormat } from '@vueuse/core'

import { useSession } from '@/composables/useSession'

import { useProfileModal } from './useProfileModal'

const { isProfileOpen, closeModal } = useProfileModal()
const { user } = useSession()

const avatarUrl = computed(() => user.value?.image)

const quotaPct = computed(() => {
  const q = user.value?.quota
  return q ? Math.round((q.used / q.total) * 100) : 0
})

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
const lastUsedIp = computed(() => user.value?.lastUsedIp || '—')

useHead({
  title: () => (isProfileOpen.value ? 'Mon Profil' : undefined),
})
</script>

<template>
  <ResponsiveModal
    v-model="isProfileOpen"
    :desktop="{ maxWidth: 460, scrollable: true, class: 'rounded-lg' }"
  >
    <v-card v-if="user" elevation="2" title="Your profile">
      <v-card-text>
        <v-row no-gutters align="center" class="mb-4">
          <v-avatar v-if="avatarUrl" size="56" class="me-3">
            <v-img
              :src="avatarUrl"
              :alt="`${user.provider} avatar`"
              referrerpolicy="no-referrer"
            >
              <template #placeholder>
                <div class="d-flex align-center fill-height justify-center">
                  <v-progress-circular
                    color="grey-lighten-4"
                    indeterminate
                  ></v-progress-circular>
                </div>
              </template>
              <template #error>
                <v-icon
                  color="grey"
                  icon="mdi-account-circle"
                  size="56"
                ></v-icon>
              </template>
            </v-img>
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

        <v-list density="compact">
          <v-list-item title="User ID" :subtitle="user.id" />
          <v-list-item
            v-if="user.providerId"
            title="Provider ID"
            :subtitle="user.providerId"
          />
          <v-list-item title="Created" :subtitle="createdAt" />
          <v-list-item title="Last login" :subtitle="lastLogin" />
          <v-list-item title="Last Used IP" :subtitle="lastUsedIp" />
        </v-list>

        <template v-if="user.quota">
          <v-divider class="my-3" />
          <div class="text-body-2 font-weight-medium mb-2">
            Quota: {{ user.quota.used }} / {{ user.quota.total }} ({{
              quotaPct
            }}%)
          </div>
          <v-progress-linear
            :model-value="quotaPct"
            height="8"
            rounded
            :color="
              ['success', 'warning', 'error'][
                Math.min(
                  2,
                  Math.floor(user.quota.used / (user.quota.total / 3)),
                )
              ]
            "
          />
        </template>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="flat" color="primary" @click="closeModal">Close</v-btn>
      </v-card-actions>
    </v-card>
    <v-card v-else elevation="2" class="rounded-lg" title="Loading profile">
      <v-skeleton-loader
        :loading="true"
        height="240"
        type="list-item-avatar-two-line, paragraph,actions"
      ></v-skeleton-loader>
    </v-card>
  </ResponsiveModal>
</template>
