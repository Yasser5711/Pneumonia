<script setup lang="ts">
const currentDate = new Date()

const socialLinks = [
  { icon: 'mdi-github', link: 'https://github.com/Yasser5711' },
  // { icon: 'mdi-web', link: 'https://yassermekhfi.tech/' },
  { icon: 'mdi-linkedin', link: 'https://www.linkedin.com/in/yasser-mekhfi/' },
]
</script>
<template>
  <v-footer class="footer pa-4">
    <v-container class="text-center">
      <div class="social-icons mb-2">
        <v-btn
          v-for="(item, index) in socialLinks"
          :key="index"
          :icon="item.icon"
          :href="item.link"
          target="_blank"
          variant="text"
          class="mx-2"
        />
      </div>

      <div class="text-caption">
        {{ currentDate.getFullYear() }} — <strong>Pneumo-AI</strong> • Built by
        <strong>Yasser Mekhfi</strong>
      </div>
    </v-container>
  </v-footer>
</template>
<style lang="scss" scoped>
.footer {
  display: contents;
}
</style>
