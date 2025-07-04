<!-- src/layouts/BaseLayout.vue -->
<template>
  <v-app class="d-flex flex-column fill-height">
    <slot name="header" />
    <!-- header facultatif -->
    <v-main
      class="d-flex flex-column flex-grow-1 overflow-hidden"
      style="min-height: 0"
    >
      <RouterView />
    </v-main>
    <slot name="footer" />
    <!-- footer facultatif -->
    <ApiKeyModal />
  </v-app>
</template>

<script setup lang="ts">
/**
 *  Vue 3.4 +: on renseigne les slots pour le type-checker.
 *  Si tu es en 3.3, passe plutôt par defineComponent({ slots: … }).
 */
import type { VNode } from 'vue'

defineSlots<{
  /** Contenu affiché avant <v-main> */
  header?: () => VNode | VNode[]
  /** Contenu affiché après <v-main>  */
  footer?: () => VNode | VNode[]
}>()
</script>
