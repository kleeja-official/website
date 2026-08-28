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
    <div
      dir="ltr"
      class="flex items-center gap-x-1.5 text-sm text-muted"
    >
      <span>Kleeja</span>
      <UIcon
        name="i-lucide-heart"
        role="img"
        :aria-label="t('footer.loves')"
        class="size-4 text-primary"
      />
      <ULink
        to="https://nuxt.com"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-x-1 hover:text-default"
      >
        <UIcon
          name="i-simple-icons-nuxt"
          class="size-4"
        />
        Nuxt
      </ULink>
    </div>

    <template #right>
      <AppFooterRight />
    </template>
  </UFooter>
</template>
