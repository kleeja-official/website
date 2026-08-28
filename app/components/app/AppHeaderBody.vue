<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

// Mirrors the Docus layer's `AppHeaderBody`, with the site-level links from
// `AppHeaderCTA` appended so they stay reachable inside the mobile menu.
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { subNavigationMode } = useSubNavigation()

const contentNavVariants = useUIConfig('contentNavigation')

const items = computed<ContentNavigationItem[]>(() => {
  const nav = navigation?.value || []
  if (!subNavigationMode.value) return nav
  return nav.map(({ children, ...item }) => ({
    ...item,
    path: children?.length ? getFirstPagePath({ ...item, children }) : item.path,
  }))
})
</script>

<template>
  <div>
    <UContentNavigation
      :collapsible="false"
      :highlight="contentNavVariants.highlight ?? true"
      :highlight-color="contentNavVariants.highlightColor"
      :variant="contentNavVariants.variant ?? 'link'"
      :color="contentNavVariants.color"
      :navigation="items"
    />

    <USeparator class="my-3" />

    <UNavigationMenu
      orientation="vertical"
      variant="link"
      :items="[{ label: 'Contributors', icon: 'i-lucide-users', to: '/contributors' }]"
    />
  </div>
</template>
