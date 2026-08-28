import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// Public origin of the deployed site. GitHub Pages serves it from the custom
// domain in `public/CNAME`, at the root, so the default `baseURL` of `/` is
// correct and only the origin needs configuring.
const siteUrl = 'https://www.kleeja.net'

const defaultLocale = 'en'

// The Docus sitemap route resolves the origin from the environment only
// (`utils/meta.ts` -> `inferSiteURL`), so it never sees `site.url` below and
// would otherwise emit relative `<loc>` entries. Export it here to keep one
// source of truth for both.
process.env.NUXT_SITE_URL ||= siteUrl

export default defineNuxtConfig({
  extends: ['docus'],

  modules: ['@nuxtjs/i18n'],

  // Docus forces the `prefix` strategy, so every page lives under a locale
  // segment (`/en/...`, `/ar/...`) and `/` redirects to the default locale.
  // A locale is only registered when `content/<code>/` exists, and the Docus
  // layer merges its own UI translations in on top of these files.
  i18n: {
    defaultLocale,
    locales: [
      { code: 'en', name: 'English', language: 'en-US', dir: 'ltr', file: 'en.json' },
      { code: 'ar', name: 'العربية', language: 'ar', dir: 'rtl', file: 'ar.json' },
    ],
  },

  site: {
    url: siteUrl,
    name: 'Kleeja',
  },

  // GitHub Pages only serves static files, so Nitro must emit a fully
  // prerendered site instead of a Node server. The preset also writes the
  // `.nojekyll` marker that stops Pages from dropping `_nuxt/`.
  nitro: {
    preset: 'github_pages',
  },

  hooks: {
    // `/` is served by the locale redirect, which Nitro resolves at request
    // time and never writes to disk — so a static build has no `index.html`
    // and the bare domain 404s on Pages. Emit the redirect as a real file
    // once the public assets are in place (the prerenderer leaves it alone).
    async 'nitro:build:public-assets'(nitro) {
      const target = `/${defaultLocale}`
      const html = `<!DOCTYPE html>
<html lang="${defaultLocale}">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=${target}">
<link rel="canonical" href="${siteUrl}${target}">
<title>Kleeja</title>
</head>
<body><a href="${target}">Continue to the Kleeja documentation</a></body>
</html>
`
      await writeFile(join(nitro.options.output.publicDir, 'index.html'), html, 'utf8')
    },
  },
})
