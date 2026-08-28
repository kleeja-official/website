export default defineNuxtConfig({
  extends: ['docus'],

  modules: ['@nuxtjs/i18n'],

  // Docus forces the `prefix` strategy, so every page lives under a locale
  // segment (`/en/...`, `/ar/...`) and `/` redirects to the default locale.
  // A locale is only registered when `content/<code>/` exists, and the Docus
  // layer merges its own UI translations in on top of these files.
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', language: 'en-US', dir: 'ltr', file: 'en.json' },
      { code: 'ar', name: 'العربية', language: 'ar', dir: 'rtl', file: 'ar.json' },
    ],
  },
})
