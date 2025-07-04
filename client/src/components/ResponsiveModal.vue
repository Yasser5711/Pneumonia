<script setup lang="ts">
import { useDisplay, type DisplayBreakpoint } from 'vuetify'

/* ---------- props & emits --------------------------------------------- */
const props = defineProps<{
  /** two-way binding */
  modelValue: boolean
  /**
   * props forwarded to <v-dialog> when on desktop
   * e.g. { maxWidth: 700, transition: 'scale-transition' }
   */
  desktop?: Record<string, unknown>
  /**
   * props forwarded to <v-bottom-sheet> when on mobile
   * e.g. { persistent: true, scrollable: true }
   */
  mobile?: Record<string, unknown>
  /** breakpoint at which we switch, default = sm */
  switchAt?: Exclude<DisplayBreakpoint, 'lgAndUp' | 'mdAndDown'>
}>()

const emit = defineEmits<{
  /** v-model support */
  'update:modelValue': [boolean]
}>()

/* ---------- breakpoint ------------------------------------------------- */
const { smAndDown, xs } = useDisplay() // comes from Vuetify
const isMobile = computed(() =>
  props.switchAt === 'xs' ? xs.value : smAndDown.value,
)

/* ---------- shared binding helpers ------------------------------------ */
const bindProps = computed(() =>
  isMobile.value ? (props.mobile ?? {}) : (props.desktop ?? {}),
)
const onUpdate = (value: boolean) => emit('update:modelValue', value)
</script>

<template>
  <!-- MOBILE -->
  <v-bottom-sheet
    v-if="isMobile"
    :model-value="modelValue"
    v-bind="bindProps"
    @update:model-value="onUpdate"
  >
    <slot />
  </v-bottom-sheet>

  <!-- DESKTOP -->
  <v-dialog
    v-else
    :model-value="modelValue"
    v-bind="bindProps"
    @update:model-value="onUpdate"
  >
    <slot />
  </v-dialog>
</template>

<script lang="ts"></script>
