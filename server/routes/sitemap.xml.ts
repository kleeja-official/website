import type { PageCollections } from '@nuxt/content'
import { queryCollection } from '@nuxt/content/server'
import { withoutTrailingSlash } from 'ufo'

// Replaces the Docus `/sitemap.xml` route. Nitro keeps the first handler it
// finds for a path and scans the project's `server/` before the layer's, so
// this one wins. The Docus route only lists the `docs_*` and `landing_*`
// collections, which leaves out the blog posts in `blog_*` and every page
// that is a Vue file rather than a content document.

// Pages in `app/pages/` with no content document behind them. Add a route
// here when a page is added there; blog posts are picked up on their own.
const APP_PAGES = ['/blog', '/store', '/contributors', '/branding']

type BlogCollection = Extract<keyof PageCollections, `blog_${string}`>

interface SitemapUrl {
  loc: string
  lastmod?: string
}

// `<lastmod>` takes a W3C date; content dates may carry a time as well.
const dateOnly = (value: unknown) => typeof value === 'string' ? value.split('T')[0] : undefined

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = withoutTrailingSlash(getSiteConfig(event).url)
  const defaultLocale = config.public.i18n.defaultLocale

  const urls: SitemapUrl[] = []

  for (const code of getAvailableLocales(config.public as Record<string, unknown>)) {
    const prefix = code === defaultLocale ? '' : `/${code}`

    for (const collection of [`landing_${code}`, `docs_${code}`] as (keyof PageCollections)[]) {
      const pages = await queryCollection(event, collection).select('path', 'meta').all()

      for (const page of pages) {
        // The same opt-outs the Docus route honours.
        if (page.meta?.sitemap === false || isNavigationPath(page.path)) {
          continue
        }
        urls.push({ loc: page.path, lastmod: dateOnly(page.meta?.modifiedAt) })
      }
    }

    urls.push(...APP_PAGES.map(path => ({ loc: `${prefix}${path}` })))

    const posts = await queryCollection(event, `blog_${code}` as BlogCollection)
      .select('path', 'date')
      .order('date', 'DESC')
      .all()

    urls.push(...posts.map(post => ({ loc: post.path, lastmod: dateOnly(post.date) })))
  }

  const entries = urls.map(({ loc, lastmod }) => [
    '  <url>',
    `    <loc>${escapeXml(`${siteUrl}${loc}`)}</loc>`,
    ...(lastmod ? [`    <lastmod>${escapeXml(lastmod)}</lastmod>`] : []),
    '  </url>',
  ].join('\n'))

  setResponseHeader(event, 'content-type', 'application/xml')
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
  ].join('\n')
})
