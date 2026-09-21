<script setup lang="ts">
// Overrides the Docus layer's `AppFooterLeft` ("Copyright © <year>") with the
// Kleeja copyright range. The site is prerendered, so the end year is baked in
// at build time and only moves on the next deploy.
//
// The brand page hangs off the footer rather than the header: it is written for
// people writing *about* Kleeja, not for the ones reading the documentation,
// and this is also where the prerender crawler finds the route.
const year = new Date().getFullYear()

const { t, localePath } = useDocusI18n()
</script>

<template>
  <div class="flex items-center gap-3 text-sm text-muted">
    <span dir="ltr">Kleeja 2007-{{ year }}</span>

    <USeparator
      orientation="vertical"
      class="h-4"
    />

    <ULink
      :to="localePath('/branding')"
      class="transition hover:text-primary"
    >
      {{ t('nav.branding') }}
    </ULink>
  </div>
</template>
