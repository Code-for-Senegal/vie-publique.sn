<!-- pages/assemblee-nationale/votes/index.vue -->
<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-900">
    <!-- Breadcrumb -->
    <div class="container mx-auto px-4 pt-4">
      <AppBreadcrumb :items="[
        { label: 'Assemblée nationale', to: '/assemblee-nationale' },
        { label: 'Votes' }
      ]" />
    </div>

    <!-- Sticky Header mobile -->
    <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm md:relative md:border-0 md:bg-transparent md:backdrop-blur-none dark:border-gray-800 dark:bg-gray-900/95">
      <div class="container mx-auto px-4 py-3 md:py-6">
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/assemblee-nationale"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 md:hidden dark:bg-gray-800"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </NuxtLink>
          <div class="min-w-0 flex-1">
            <h1 class="text-lg font-bold text-gray-900 md:text-2xl dark:text-white">
              Votes
            </h1>
            <p v-if="!loading && votes.length" class="mt-0.5 text-xs text-gray-500 md:text-sm dark:text-gray-400">
              {{ votes.length }} textes votés
            </p>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-4">
      <!-- Intro -->
      <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Décryptage des votes de la législature en cours, reformulés pour une meilleure compréhension.
      </p>

      <!-- Loading State -->
      <div v-if="loading && !votes.length" class="space-y-3">
        <div v-for="i in 4" :key="i" class="rounded-xl bg-white p-4 dark:bg-gray-800">
          <div class="mb-3 flex items-center justify-between">
            <USkeleton class="h-5 w-20 rounded-full" />
            <USkeleton class="h-5 w-16 rounded-full" />
          </div>
          <USkeleton class="mb-2 h-5 w-full" />
          <USkeleton class="h-4 w-3/4" />
          <USkeleton class="mt-3 h-3 w-24" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-2xl bg-red-50 p-6 text-center dark:bg-red-900/20">
        <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto mb-3 h-10 w-10 text-red-500" />
        <h3 class="font-semibold text-red-800 dark:text-red-200">Erreur de chargement</h3>
        <p class="mt-1 text-sm text-red-600 dark:text-red-300">{{ error }}</p>
      </div>

      <!-- Votes List -->
      <div v-else class="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
        <NuxtLink
          v-for="vote in votes"
          :key="vote.id"
          :to="`/assemblee-nationale/votes/${vote.id}`"
          class="block rounded-xl bg-white p-4 ring-1 ring-gray-100 transition-all active:scale-[0.99] md:hover:ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 dark:md:hover:ring-gray-600"
        >
          <!-- Header: Type et Status -->
          <div class="mb-3 flex items-center justify-between">
            <span class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {{ $getAssemblyVoteLabel(vote.type) }}
            </span>
            <span
              :class="[
                'rounded-full px-2.5 py-1 text-xs font-semibold uppercase',
                vote.status === 'adopted'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              ]"
            >
              {{ vote.status === 'adopted' ? 'Adopté' : 'Rejeté' }}
            </span>
          </div>

          <!-- Title -->
          <h2 class="line-clamp-2 text-sm font-semibold text-gray-900 md:text-base dark:text-white">
            {{ vote.name }}
          </h2>

          <!-- Date -->
          <time class="mt-2 block text-xs text-gray-400">
            {{ $dateformat(vote.date) }}
          </time>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div
        v-if="!loading && !error && votes.length === 0"
        class="rounded-2xl bg-white p-8 text-center ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
      >
        <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
          <UIcon name="i-heroicons-document-check" class="h-7 w-7 text-gray-400" />
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Aucun vote enregistré</p>
      </div>
    </main>

    <ScrollToTopButton />
  </div>
</template>

<script setup lang="ts">
const { siteUrl } = useSiteMetadata();

// ✅ Nouvelle architecture SSR : les données sont chargées automatiquement
const { votes, loading, error } = useAssemblyVotes();

const breadcrumbSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Assemblée nationale',
      item: `${siteUrl}/assemblee-nationale`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Votes',
      item: `${siteUrl}/assemblee-nationale/votes`,
    },
  ],
}));

useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbSchema.value),
    },
  ],
});
</script>
