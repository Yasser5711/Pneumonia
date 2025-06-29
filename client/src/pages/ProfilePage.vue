<script setup lang="ts">


import { useProfileModal } from '@/components/useProfileModal'
import { useSession } from '@/composables/useSession'

definePage({
  path: '/profile',
  name: 'ProfilePage',
  meta: {
    requiresAuth: true,
    title: 'Profile',
    layout: 'DefaultLayout',
  },
})

const { openModal } = useProfileModal()
const { user } = useSession()
const router = useRouter()

onMounted(() => {
  if (!user.value) {
    router.replace({ name: 'IndexPage', query: { error: 'not_logged' } })
    return
  }
  openModal()
})
</script>

<template>
  <ProfileModal />
</template>
