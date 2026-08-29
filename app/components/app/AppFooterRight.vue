<script setup lang="ts">
// Mirrors the Docus layer's `AppFooterRight` minus the link it appends from
// `github.url`: that is the documentation repo behind the "Edit this page"
// links, so the footer would otherwise show two GitHub icons pointing at
// different repositories. `socials.github` carries the Kleeja one.
const appConfig = useAppConfig()
const { forced: forcedColorMode } = useDocusColorMode()

interface FooterLink {
  'icon': string
  'to': string
  'target': '_blank'
  'aria-label': string
}

const links = computed<FooterLink[]>(() => Object.entries(appConfig.socials || {}).flatMap(([key, url]) => {
  if (typeof url !== 'string' || !url) {
    return []
  }

  return [{
    'icon': `i-simple-icons-${key}`,
    'to': url,
    'target': '_blank' as const,
    'aria-label': `${key} social link`,
  }]
}))
</script>

<template>
  <template v-if="links.length">
    <UButton
      v-for="(link, index) of links"
      :key="index"
      size="sm"
      v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
    />
  </template>
  <UColorModeButton v-if="!forcedColorMode" />
</template>
