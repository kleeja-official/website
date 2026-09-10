<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

// Mirrors the Docus layer's `AppHeaderBody`, with the site-level links from
// `AppHeaderCTA` appended so they stay reachable inside the mobile menu.
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { t, localePath } = useDocusI18n()
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

const extraItems = computed(() => [
  { label: t('nav.documentation'), icon: 'i-lucide-book-open', to: localePath('/getting-started/introduction') },
  { label: t('nav.plugins'), icon: 'i-lucide-puzzle', to: localePath('/plugins') },
  { label: t('nav.contributors'), icon: 'i-lucide-users', to: localePath('/contributors') },
])
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
      :items="extraItems"
    />
  </div>
</template>
