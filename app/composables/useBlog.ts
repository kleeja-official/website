import type { Collections } from '@nuxt/content'

type BlogCollection = Extract<keyof Collections, `blog_${string}`>

export const useBlog = () => {
  const { locale } = useI18n()

  // One collection per locale, declared in `content.config.ts`.
  const collection = computed(() => `blog_${locale.value}` as BlogCollection)

  // `-u-nu-latn` keeps Western digits under Arabic, like the contributors
  // page. Dates are written without a time, so they are read back as UTC
  // midnight and must be shown in UTC too, or readers west of Greenwich see
  // the day before.
  const dateFormat = computed(() => new Intl.DateTimeFormat(
    locale.value === 'ar' ? 'ar-u-nu-latn' : 'en-US',
    { dateStyle: 'long', timeZone: 'UTC' },
  ))
  const formatDate = (date: string | Date) => dateFormat.value.format(new Date(date))

  return { collection, formatDate }
}
