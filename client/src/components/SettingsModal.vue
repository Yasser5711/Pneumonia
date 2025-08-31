<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { VForm } from 'vuetify/components'

import { useSettingsModal } from '@/components/useSettingsModal'
import { useLocale } from '@/composables/useLocale'
import { usePixiBgConfig } from '@/composables/usePixiBgConfig'
import { useTheme } from '@/composables/useTheme'
const { isSettingsOpen, closeModal } = useSettingsModal()
const { themeMode } = useTheme()
const { locales, resolvedLocale, setLocale } = useLocale()
const { mobile } = useDisplay()
const { cfg, reset, randomize } = usePixiBgConfig()
const { t } = useI18n()
const form = ref<VForm | null>(null)
// const isExploding = ref(false)
// const intervalId = ref<ReturnType<typeof setInterval> | null>(null)
// function startExplosions() {
//   isExploding.value = true
//   intervalId.value = setInterval(() => {
//     window.dispatchEvent(new CustomEvent('pixi-explosion'))
//   }, 1500)
// }

// function stopExplosions() {
//   isExploding.value = false
//   if (intervalId.value) {
//     clearInterval(intervalId.value)
//     intervalId.value = null
//   }
// }
const toIso = (loc: string) => (loc === 'en' ? 'gb' : loc)
const localesList = computed(() => {
  return locales.value.map((loc) => ({
    title: loc === 'fr' ? 'Français' : 'English',
    value: loc,
    'prepend-icon': `fi-${toIso(loc)}`,
  }))
})
</script>

<template>
  <ResponsiveModal
    v-model="isSettingsOpen"
    :desktop="{
      maxWidth: 700,
      transition: 'scroll-y-transition',
      scrollable: true,
    }"
    :mobile="{
      closable: true,
    }"
  >
    <v-card :title="t('SettingsModal.title')">
      <v-card-text>
        <v-container fluid>
          <!-- ---- Thème ---- -->
          <v-row dense>
            <v-col cols="12">
              <v-select
                v-model="themeMode.mode"
                :item-props="true"
                :items="[
                  {
                    title: t('SettingsModal.theme.auto'),
                    value: 'auto',
                    'prepend-icon': 'mdi-monitor-dashboard',
                  },
                  {
                    title: t('SettingsModal.theme.light'),
                    value: 'light',
                    'prepend-icon': 'mdi-white-balance-sunny',
                  },
                  {
                    title: t('SettingsModal.theme.dark'),
                    value: 'dark',
                    'prepend-icon': 'mdi-moon-waning-crescent',
                  },
                ]"
                :label="t('SettingsModal.theme.label')"
                density="comfortable"
                hide-details
              />
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12">
              <v-select
                :model-value="resolvedLocale"
                :items="localesList"
                :item-props="true"
                :label="t('SettingsModal.locale.label')"
                density="comfortable"
                hide-details
                @update:model-value="setLocale"
              >
              </v-select>
            </v-col>
          </v-row>
          <!-- ---- Pixi Config ---- -->
          <v-form ref="form">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="cfg.mode"
                  :items="[
                    { title: t('SettingsModal.pixi.mode.idle'), value: 'idle' },
                    {
                      title: t('SettingsModal.pixi.mode.repel'),
                      value: 'repel',
                    },
                    {
                      title: t('SettingsModal.pixi.mode.gravity'),
                      value: 'gravity',
                    },
                    {
                      title: t('SettingsModal.pixi.mode.orbit'),
                      value: 'orbit',
                    },
                  ]"
                  :label="t('SettingsModal.pixi.mode.label')"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="12">
                <v-slider
                  v-model="cfg.scale"
                  :min="50"
                  :max="1000"
                  :step="50"
                  :label="t('SettingsModal.pixi.scale.label')"
                  hide-details
                />
              </v-col>
              <v-col cols="12">
                <v-slider
                  v-model="cfg.spacing"
                  :min="5"
                  :max="50"
                  step="1"
                  :label="t('SettingsModal.pixi.spacing.label')"
                  hide-details
                />
              </v-col>
              <v-col cols="12">
                <v-slider
                  v-model="cfg.length"
                  :min="1"
                  :max="20"
                  step="1"
                  :label="t('SettingsModal.pixi.length.label')"
                  hide-details
                />
              </v-col>
              <v-col cols="12">
                <v-slider
                  v-model="cfg.transition"
                  :min="0"
                  :max="0.3"
                  step="0.01"
                  :label="t('SettingsModal.pixi.transition.label')"
                  hide-details
                />
              </v-col>
              <v-col :cols="mobile ? 12 : 6">
                <v-slider
                  v-model="cfg.repelForce"
                  :min="10"
                  :max="100"
                  step="1"
                  :label="t('SettingsModal.pixi.repelForce.label')"
                  hide-details
                />
              </v-col>
              <v-col :cols="mobile ? 12 : 6">
                <v-slider
                  v-model="cfg.gravityForce"
                  :min="10"
                  :max="100"
                  step="1"
                  :label="t('SettingsModal.pixi.gravityForce.label')"
                  hide-details
                />
              </v-col>
              <v-col :cols="mobile ? 12 : 6">
                <v-slider
                  v-model="cfg.orbitRadius"
                  :min="10"
                  :max="100"
                  step="1"
                  :label="t('SettingsModal.pixi.orbitRadius.label')"
                  hide-details
                />
              </v-col>
              <v-col :cols="mobile ? 12 : 6">
                <v-slider
                  v-model="cfg.mouseRadius"
                  :min="20"
                  :max="300"
                  step="5"
                  :label="t('SettingsModal.pixi.mouseRadius.label')"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-form>
          <v-divider class="my-4" />
          <v-btn
            color="secondary"
            prepend-icon="mdi-shuffle-variant"
            :text="t('SettingsModal.pixi.randomize.title')"
            @click="randomize()"
          />

          <!-- <v-row
          > <v-col cols="12"
            >
            <h3 class="text-subtitle-1">🎚️ Presets</h3>
             </v-col
          > <v-col cols="8"
            > <v-text-field
              v-model="newPresetName"
              label="Nom du preset"
              density="compact"
              hide-details
            /> </v-col
          > <v-col cols="4"
            > <v-btn
              block
              :disabled="!newPresetName"
              @click="savePreset(newPresetName)"
              > Sauver </v-btn
            > </v-col
          > <v-col cols="12"
            > <v-select
              label="Charger un preset"
              :items="Object.keys(presets)"
              density="comfortable"
              hide-details
              @update:model-value="console.log('loadPreset', $event)"
            /> </v-col
          > </v-row
        > -->
        </v-container>
      </v-card-text>
      <v-card-actions class="justify-space-between">
        <v-btn
          variant="text"
          :text="t('SettingsModal.pixi.reset.title')"
          @click="reset"
        />
        <v-btn
          color="error"
          :text="t('SettingsModal.pixi.close.title')"
          @click="closeModal"
        />
      </v-card-actions>
    </v-card>
  </ResponsiveModal>
</template>
