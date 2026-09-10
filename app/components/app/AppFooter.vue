<script setup lang="ts">
// Mirrors the Docus layer's `AppFooter`, filling the otherwise empty center
// slot of `UFooter` with the "Kleeja ♥ Nuxt" credit.
const { t } = useDocusI18n()
</script>

<template>
  <UFooter>
    <template #left>
      <AppFooterLeft />
    </template>

    <!-- `dir="ltr"`: both names are Latin script, so the flex row must keep
         its order under the RTL locale instead of reading "Nuxt ♥ Kleeja". -->

    <template #right>
      <AppFooterRight />
    </template>
  </UFooter>
</template>
