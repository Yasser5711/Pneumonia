<script setup lang="ts">
import { ref } from 'vue'

import { VForm } from 'vuetify/components'

import { useSettingsModal } from '@/components/useSettingsModal'
import { usePixiBgConfig } from '@/composables/usePixiBgConfig'
import { useTheme } from '@/composables/useTheme'

const { isSettingsOpen, closeModal } = useSettingsModal()
const { themeMode } = useTheme()
const { cfg, reset, randomize } = usePixiBgConfig()

const form = ref<VForm | null>(null)
const isExploding = ref(false)
const intervalId = ref<ReturnType<typeof setInterval> | null>(null)
function startExplosions() {
  isExploding.value = true
  intervalId.value = setInterval(() => {
    window.dispatchEvent(new CustomEvent('pixi-explosion'))
  }, 1500)
}

function stopExplosions() {
  isExploding.value = false
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
}
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
    <v-card class="mx-auto" max-width="480" title="Paramètres d’affichage">
      <v-card-text>
        <!-- ---- Thème ---- -->
        <v-row dense>
          <v-col cols="12">
            <v-select
              v-model="themeMode.mode"
              :item-props="true"
              :items="[
                {
                  title: 'Auto',
                  value: 'auto',
                  'prepend-icon': 'mdi-monitor-dashboard',
                },
                {
                  title: 'Clair',
                  value: 'light',
                  'prepend-icon': 'mdi-white-balance-sunny',
                },
                {
                  title: 'Sombre',
                  value: 'dark',
                  'prepend-icon': 'mdi-moon-waning-crescent',
                },
              ]"
              label="Thème"
              density="comfortable"
              hide-details
            />
          </v-col>
        </v-row>
        <!-- ---- Pixi Config ---- -->
        <v-form ref="form">
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="cfg.mode"
                :items="[
                  { title: 'Idle', value: 'idle' },
                  { title: 'Repel', value: 'repel' },
                  { title: 'Gravity', value: 'gravity' },
                  { title: 'Orbit', value: 'orbit' },
                ]"
                label="Mode d’interaction"
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
                label="Échelle du bruit"
                hide-details
              />
            </v-col>
            <v-col cols="12">
              <v-slider
                v-model="cfg.spacing"
                :min="5"
                :max="50"
                step="1"
                label="Espacement"
                hide-details
              />
            </v-col>
            <v-col cols="12">
              <v-slider
                v-model="cfg.length"
                :min="1"
                :max="20"
                step="1"
                label="Longueur des lignes"
                hide-details
              />
            </v-col>
            <v-col cols="12">
              <v-slider
                v-model="cfg.transition"
                :min="0"
                :max="0.3"
                step="0.01"
                label="Fluidité (transition)"
                hide-details
              />
            </v-col>
            <!-- Forces regroupées sur deux colonnes -->
            <v-col cols="6">
              <v-slider
                v-model="cfg.repelForce"
                :min="10"
                :max="100"
                step="1"
                label="Repel"
                hide-details
              />
            </v-col>
            <v-col cols="6">
              <v-slider
                v-model="cfg.gravityForce"
                :min="10"
                :max="100"
                step="1"
                label="Gravity"
                hide-details
              />
            </v-col>
            <v-col cols="6">
              <v-slider
                v-model="cfg.orbitRadius"
                :min="10"
                :max="100"
                step="1"
                label="Rayon Orbit"
                hide-details
              />
            </v-col>
            <v-col cols="6">
              <v-slider
                v-model="cfg.mouseRadius"
                :min="20"
                :max="300"
                step="5"
                label="Rayon Souris"
                hide-details
              />
            </v-col>
          </v-row>
        </v-form>
        <v-divider class="my-4" />
        <v-btn
          color="secondary"
          prepend-icon="mdi-shuffle-variant"
          @click="randomize()"
        >
          Randomizer
        </v-btn>
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
      </v-card-text>
      <v-card-actions class="justify-space-between">
        <v-btn
          :disabled="true"
          @click="isExploding ? stopExplosions() : startExplosions()"
        >
          {{ isExploding ? 'Stop Show' : 'Start Show' }} </v-btn
        ><v-btn variant="text" text="Réinitialiser" @click="reset" />
        <v-btn color="error" text="Close" @click="closeModal" />
      </v-card-actions>
    </v-card>
  </ResponsiveModal>
</template>
