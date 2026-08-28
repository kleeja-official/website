<script setup lang="ts">
// Overrides the empty `AppHeaderCTA` slot from the Docus layer to put the
// Contributors link in the header, next to the search and theme controls.
const links = [
  { label: 'Contributors', icon: 'i-lucide-users', to: '/contributors' },
]
</script>

<template>
  <UNavigationMenu
    :items="links"
    variant="link"
    class="hidden lg:flex"
  />
</template>
