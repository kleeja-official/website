<script setup lang="ts">
// Overrides the Docus layer's `AppFooterLeft` ("Copyright © <year>") with the
// Kleeja copyright range. The site is prerendered, so the end year is baked in
// at build time and only moves on the next deploy.
const year = new Date().getFullYear()
</script>

<template>
  <div
    dir="ltr"
    class="text-sm text-muted"
  >
    Kleeja 2007-{{ year }}
  </div>
</template>
