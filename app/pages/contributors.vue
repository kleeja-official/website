<script setup lang="ts">
interface Contributor {
  login: string
  id: number
  avatar_url: string
  html_url: string
  type: string
  contributions: number
}

// github.com/kleeja-official/kleeja — addressed by id so a repo rename can't break it
const CONTRIBUTORS_API = 'https://api.github.com/repositories/116738112/contributors?per_page=100'
const REPO_URL = 'https://github.com/kleeja-official/kleeja'

definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'Contributors',
  description: 'The people who build Kleeja — everyone who has contributed code to the Kleeja repository on GitHub.',
  ogTitle: 'Kleeja Contributors',
  ogDescription: 'The people who build Kleeja — everyone who has contributed code to the Kleeja repository on GitHub.',
})

// Fetched in the browser so the list stays current on a statically generated
// site, and so a build never fails on GitHub's unauthenticated rate limit.
const { data, status, error, refresh } = useFetch<Contributor[]>(CONTRIBUTORS_API, {
  key: 'kleeja-contributors',
  server: false,
  lazy: true,
  default: () => [],
})

const contributors = computed(() =>
  [...(data.value || [])].sort((a, b) => b.contributions - a.contributions),
)

const totalCommits = computed(() =>
  contributors.value.reduce((total, person) => total + person.contributions, 0),
)

const topContributions = computed(() => contributors.value[0]?.contributions || 1)

const numberFormat = new Intl.NumberFormat('en-US')
const format = (value: number) => numberFormat.format(value)

const share = (person: Contributor) =>
  Math.max(4, Math.round((person.contributions / topContributions.value) * 100))

// Gold / silver / bronze for the three most active contributors.
const rankStyles: Record<number, { ring: string, badge: string, icon: string, iconColor: string }> = {
  1: {
    ring: 'ring-amber-400/60 dark:ring-amber-400/40',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300',
    icon: 'i-lucide-crown',
    iconColor: 'text-amber-500',
  },
  2: {
    ring: 'ring-zinc-400/50 dark:ring-zinc-400/30',
    badge: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-400/15 dark:text-zinc-300',
    icon: 'i-lucide-medal',
    iconColor: 'text-zinc-400',
  },
  3: {
    ring: 'ring-orange-400/50 dark:ring-orange-400/30',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-300',
    icon: 'i-lucide-medal',
    iconColor: 'text-orange-400',
  },
}

const stats = computed(() => [
  { label: 'Contributors', value: format(contributors.value.length), icon: 'i-lucide-users' },
  { label: 'Commits', value: format(totalCommits.value), icon: 'i-lucide-git-commit-horizontal' },
  { label: 'Since', value: '2007', icon: 'i-lucide-calendar-days' },
])
</script>

<template>
  <UContainer class="py-12 sm:py-16">
    <div class="text-center max-w-2xl mx-auto">
      <UBadge
        color="primary"
        variant="subtle"
        icon="i-lucide-heart-handshake"
        size="lg"
      >
        Open source
      </UBadge>

      <h1 class="mt-4 text-4xl sm:text-5xl font-bold text-highlighted text-balance">
        The people behind Kleeja
      </h1>

      <p class="mt-4 text-lg text-muted text-balance">
        Kleeja is built in the open. Every name below has written code that ships in
        the release you download — pulled live from GitHub.
      </p>

      <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
        <UButton
          :to="REPO_URL"
          target="_blank"
          icon="i-simple-icons-github"
          size="lg"
        >
          Contribute on GitHub
        </UButton>

        <UButton
          :to="`${REPO_URL}/issues`"
          target="_blank"
          color="neutral"
          variant="outline"
          icon="i-lucide-circle-dot"
          size="lg"
        >
          Browse open issues
        </UButton>
      </div>
    </div>

    <!-- Stats -->
    <div
      v-if="status === 'success' && contributors.length"
      class="mt-12 grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto"
    >
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-lg border border-default bg-elevated/40 px-3 py-4 text-center"
      >
        <UIcon
          :name="stat.icon"
          class="size-5 text-primary mx-auto"
        />
        <div class="mt-2 text-2xl font-semibold text-highlighted tabular-nums">
          {{ stat.value }}
        </div>
        <div class="text-xs text-muted uppercase tracking-wide">
          {{ stat.label }}
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="status === 'pending' || status === 'idle'"
      class="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="n in 6"
        :key="n"
        class="rounded-lg border border-default p-5 flex items-center gap-4"
      >
        <USkeleton class="size-14 rounded-full shrink-0" />
        <div class="flex-1 space-y-2">
          <USkeleton class="h-4 w-28" />
          <USkeleton class="h-3 w-20" />
          <USkeleton class="h-1.5 w-full" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <UAlert
      v-else-if="error"
      class="mt-12"
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Couldn't load the contributors"
      :description="`GitHub returned an error${error.statusCode ? ` (${error.statusCode})` : ''}. This is usually the API rate limit — try again in a minute.`"
      :actions="[{ label: 'Try again', color: 'error', variant: 'outline', onClick: () => refresh() }]"
    />

    <!-- Empty -->
    <div
      v-else-if="!contributors.length"
      class="mt-12 text-center text-muted"
    >
      No contributors to show yet.
    </div>

    <!-- Contributors -->
    <div
      v-else
      class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <ULink
        v-for="(person, index) in contributors"
        :key="person.id"
        :to="person.html_url"
        target="_blank"
        rel="noopener"
        class="group relative rounded-lg border border-default bg-default p-5 flex items-center gap-4 transition hover:border-primary hover:bg-primary/5"
      >
        <div class="relative shrink-0">
          <UAvatar
            :src="person.avatar_url"
            :alt="person.login"
            size="3xl"
            :class="[
              'ring-2 ring-offset-2 ring-offset-default',
              rankStyles[index + 1]?.ring || 'ring-default',
            ]"
          />
          <UIcon
            v-if="rankStyles[index + 1]"
            :name="rankStyles[index + 1]!.icon"
            class="absolute -top-1 -right-1 size-5 drop-shadow"
            :class="rankStyles[index + 1]!.iconColor"
          />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-highlighted truncate group-hover:text-primary">
              {{ person.login }}
            </span>
            <UBadge
              v-if="person.type === 'Bot'"
              color="neutral"
              variant="subtle"
              size="sm"
            >
              bot
            </UBadge>
          </div>

          <div class="mt-0.5 text-sm text-muted tabular-nums">
            {{ format(person.contributions) }} {{ person.contributions === 1 ? 'commit' : 'commits' }}
          </div>

          <div
            class="mt-2.5 h-1.5 w-full rounded-full bg-elevated overflow-hidden"
            role="presentation"
          >
            <div
              class="h-full rounded-full bg-primary transition-[width] duration-500"
              :style="{ width: `${share(person)}%` }"
            />
          </div>
        </div>

        <span
          class="absolute top-3 right-3 text-xs font-medium tabular-nums rounded-full px-2 py-0.5"
          :class="rankStyles[index + 1]?.badge || 'bg-elevated text-dimmed'"
        >
          #{{ index + 1 }}
        </span>
      </ULink>
    </div>

    <!-- CTA -->
    <div
      v-if="status === 'success' && contributors.length"
      class="mt-12 rounded-lg border border-dashed border-default p-8 text-center"
    >
      <UIcon
        name="i-lucide-git-pull-request-arrow"
        class="size-8 text-primary mx-auto"
      />
      <h2 class="mt-3 text-xl font-semibold text-highlighted">
        Want your avatar on this page?
      </h2>
      <p class="mt-2 text-muted max-w-lg mx-auto">
        Bug fixes, translations, plugins, styles and documentation are all welcome.
        Open a pull request and you'll show up here on the next visit.
      </p>
      <UButton
        class="mt-4"
        :to="`${REPO_URL}/pulls`"
        target="_blank"
        color="neutral"
        variant="outline"
        trailing-icon="i-lucide-arrow-right"
      >
        Open a pull request
      </UButton>
    </div>
  </UContainer>
</template>
