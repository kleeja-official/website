<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { joinURL } from 'ufo'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const site = useSiteConfig()
const { collection, formatDate } = useBlog()

// Post paths already carry the locale prefix (`content.config.ts`), so the
// route path is looked up as it is. Neighbours are ordered by date, oldest
// first, so "previous" is the older post and "next" the newer one.
const [{ data: post }, { data: surround }] = await Promise.all([
  useAsyncData(
    () => `blog-post-${route.path}`,
    () => queryCollection(collection.value).path(route.path).first(),
  ),
  useAsyncData(
    () => `blog-post-${route.path}-surround`,
    () => queryCollectionItemSurroundings(collection.value, route.path, { fields: ['description'] })
      .order('date', 'ASC'),
  ),
])

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const pageUrl = joinURL(site.url, route.path)

// The header image doubles as the social preview. Crawlers need an absolute
// URL for it.
useSeo({
  title: post.value.title,
  description: post.value.description,
  type: 'article',
  ogImage: post.value.image ? joinURL(site.url, post.value.image) : undefined,
  publishedAt: post.value.date,
})

const breadcrumb = computed(() => [
  { label: t('nav.blog'), icon: 'i-lucide-newspaper', to: localePath('/blog') },
  { label: post.value?.title },
])

// Counts the words of the rendered text only, so front matter and markup
// don't inflate it. Minimark elements are `[tag, props, ...children]`.
const countWords = (node: unknown): number => {
  if (typeof node === 'string') {
    return node.split(/\s+/).filter(Boolean).length
  }
  return Array.isArray(node)
    ? node.slice(2).reduce((total: number, child) => total + countWords(child), 0)
    : 0
}

// ~200 words a minute is the usual estimate for reading on screen.
const readingTime = computed(() => {
  const words = (post.value?.body.value || []).reduce((total: number, node) => total + countWords(node), 0)
  return Math.max(1, Math.round(words / 200))
})

// Only posts with `##` / `###` headings get a table of contents.
const toc = computed(() => post.value?.body.toc?.links || [])

const shareLinks = computed(() => {
  const url = encodeURIComponent(pageUrl)
  const text = encodeURIComponent(post.value?.title || '')

  return [
    { label: 'X', icon: 'i-simple-icons-x', to: `https://x.com/intent/post?url=${url}&text=${text}` },
    { label: 'Facebook', icon: 'i-simple-icons-facebook', to: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
    { label: 'LinkedIn', icon: 'i-simple-icons-linkedin', to: `https://www.linkedin.com/sharing/share-offsite/?url=${url}` },
  ]
})

const { copy, copied, isSupported: canCopy } = useClipboard({ copiedDuring: 1500 })

// Points back at the list, against the reading direction, so it flips under
// Arabic.
const backArrow = computed(() =>
  locale.value === 'ar' ? 'i-lucide-arrow-right' : 'i-lucide-arrow-left',
)
</script>

<template>
  <UContainer
    v-if="post"
    class="py-10 sm:py-14"
  >
    <!-- Widened only to make room for the table of contents; without one the
         image, text and footer share a single reading-width column. -->
    <article
      class="mx-auto"
      :class="toc.length ? 'max-w-5xl' : 'max-w-3xl'"
    >
      <!-- A long title truncates first, so "Blog" stays readable on phones. -->
      <UBreadcrumb
        :items="breadcrumb"
        :ui="{ item: 'first:shrink-0' }"
      />

      <header class="mt-8 max-w-3xl">
        <h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-primary text-balance">
          {{ post.title }}
        </h1>

        <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <UUser
            :name="post.author.name"
            :avatar="{ src: `https://github.com/${post.author.github}.png?size=96` }"
            :to="`https://github.com/${post.author.github}`"
            target="_blank"
            size="lg"
          >
            <!-- Isolated so the `@` stays in front of the handle under Arabic. -->
            <template #description>
              <span dir="ltr">@{{ post.author.github }}</span>
            </template>
          </UUser>

          <USeparator
            orientation="vertical"
            class="hidden h-8 sm:flex"
          />

          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span class="inline-flex items-center gap-1.5">
              <UIcon
                name="i-lucide-calendar-days"
                class="size-4"
              />
              <time :datetime="post.date">{{ formatDate(post.date) }}</time>
            </span>

            <span class="inline-flex items-center gap-1.5">
              <UIcon
                name="i-lucide-clock"
                class="size-4"
              />
              {{ t('blog.readingTime', { count: readingTime }, readingTime) }}
            </span>
          </div>
        </div>
      </header>

      <img
        v-if="post.image"
        :src="post.image"
        alt=""
        class="mt-10 w-full rounded-xl ring ring-default"
      >

      <div
        class="mt-10"
        :class="{ 'lg:grid lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-12': toc.length }"
      >
        <!-- First in the source so that, below `lg`, it sits above the post as
             a collapsible bar; on wider screens it moves to the side. -->
        <aside
          v-if="toc.length"
          class="lg:order-last"
        >
          <UContentToc
            :links="toc"
            highlight
          />
        </aside>

        <div class="min-w-0">
          <ContentRenderer :value="post" />

          <USeparator class="mt-12" />

          <footer class="mt-6 flex flex-wrap items-center justify-between gap-4">
            <UButton
              :to="localePath('/blog')"
              :icon="backArrow"
              color="neutral"
              variant="ghost"
              class="-ms-2.5"
            >
              {{ t('blog.back') }}
            </UButton>

            <div class="flex items-center gap-1">
              <span class="me-1 text-sm text-muted">{{ t('blog.share') }}</span>

              <UTooltip
                v-for="link in shareLinks"
                :key="link.label"
                :text="link.label"
              >
                <UButton
                  :to="link.to"
                  target="_blank"
                  :icon="link.icon"
                  :aria-label="t('blog.shareOn', { network: link.label })"
                  color="neutral"
                  variant="ghost"
                />
              </UTooltip>

              <!-- The Clipboard API only exists in the browser, so rendering this
                   on the server would not match what the client hydrates. -->
              <ClientOnly>
                <UTooltip
                  v-if="canCopy"
                  :text="copied ? t('blog.copied') : t('blog.copyLink')"
                >
                  <UButton
                    :icon="copied ? 'i-lucide-check' : 'i-lucide-link'"
                    :aria-label="t('blog.copyLink')"
                    color="neutral"
                    variant="ghost"
                    @click="copy(pageUrl)"
                  />
                </UTooltip>
              </ClientOnly>
            </div>
          </footer>

          <UContentSurround
            v-if="surround?.some(Boolean)"
            :surround="surround"
            class="mt-10"
          />
        </div>
      </div>
    </article>
  </UContainer>
</template>
