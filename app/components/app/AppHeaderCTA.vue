<script setup lang="ts">
// Overrides the empty `AppHeaderCTA` slot from the Docus layer to put the
// Documentation, Plugins and Contributors links in the header, next to the search
// and theme controls.
const { t, localePath } = useDocusI18n()

const links = computed(() => [
  { label: t('nav.documentation'), icon: 'i-lucide-book-open', to: localePath('/getting-started/introduction') },
  { label: t('nav.plugins'), icon: 'i-lucide-puzzle', to: localePath('/plugins') },
  { label: t('nav.contributors'), icon: 'i-lucide-users', to: localePath('/contributors') },
])
</script>

<template>
  <UNavigationMenu
    :items="links"
    variant="link"
    class="hidden lg:flex"
  />
</template>
