import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { useNuxt } from '@nuxt/kit'
import { join } from 'pathe'

// Docus derives its collections from `i18n.locales` and prefixes every one of
// them with `/<code>`, which only lines up with the routes while `@nuxtjs/i18n`
// uses the `prefix` strategy. `nuxt.config.ts` switches it to
// `prefix_except_default`, so the default locale is re-declared here without a
// prefix — the page components look documents up by `route.path`, and the
// navigation, breadcrumbs, surroundings and sitemap all follow from that.
// Collections are merged by name across layers, with the project winning, so
// these four replace the Docus ones.
const defaultLocale = 'en'
const locales = ['en', 'ar']

const { options } = useNuxt()
const contentDir = join(options.rootDir, 'content')

const docsSchema = z.object({
  links: z.array(z.object({
    label: z.string(),
    icon: z.string(),
    to: z.string(),
    target: z.string().optional(),
  })).optional(),
})

const collections = Object.fromEntries(locales.flatMap((code) => {
  const prefix = code === defaultLocale ? '/' : `/${code}`

  return [
    // `cwd` points at the locale folder so the `en/` segment is stripped from
    // the document id before `prefix` is applied.
    [`landing_${code}`, defineCollection({
      type: 'page',
      source: {
        cwd: join(contentDir, code),
        include: 'index.md',
        prefix,
      },
    })],
    [`docs_${code}`, defineCollection({
      type: 'page',
      source: {
        cwd: contentDir,
        include: `${code}/**/*`,
        prefix,
        exclude: [`${code}/index.md`],
      },
      schema: docsSchema,
    })],
  ]
}))

export default defineContentConfig({ collections })
