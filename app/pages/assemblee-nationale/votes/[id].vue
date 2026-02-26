<!-- pages/assemblee-nationale/votes/[id].vue -->
<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-900">
    <!-- Breadcrumb -->
    <div class="container mx-auto px-4 pt-4">
      <AppBreadcrumb :items="[
        { label: 'Assemblée nationale', to: '/assemblee-nationale' },
        { label: 'Votes', to: '/assemblee-nationale/votes' },
        { label: vote?.name || 'Détail' }
      ]" />
    </div>

    <!-- Hero section avec image de fond -->
    <div
      class="relative h-48 bg-gray-900 bg-cover bg-center md:h-56"
      style="background-image: url('/images/menu/assemblee-nationale-1.jpg')"
    >
      <div class="absolute inset-0 bg-black/50" />
      <div class="absolute right-4 top-4">
        <span
          v-if="vote"
          class="rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
        >
          {{ $getAssemblyVoteLabel(vote.type) }}
        </span>
      </div>
    </div>

    <!-- Contenu principal -->
    <main class="container mx-auto px-4">
      <div class="relative -mt-16 space-y-4">
        <!-- Loading State -->
        <div v-if="loading" class="space-y-4">
          <div class="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <USkeleton class="mb-3 h-4 w-32" />
            <USkeleton class="mb-4 h-8 w-full" />
            <USkeleton class="h-6 w-24 rounded-full" />
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="rounded-2xl bg-red-50 p-6 text-center shadow-lg dark:bg-red-900/20">
          <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto mb-3 h-10 w-10 text-red-500" />
          <h3 class="font-semibold text-red-800 dark:text-red-200">Erreur de chargement</h3>
          <p class="mt-1 text-sm text-red-600 dark:text-red-300">Impossible de charger ce vote</p>
        </div>

        <!-- Content -->
        <template v-else-if="vote">
          <!-- Vote Info Card -->
          <section class="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-gray-100 md:p-6 dark:bg-gray-800 dark:ring-gray-700">
            <!-- Header with meta and share button -->
            <div class="mb-2 flex items-start justify-between gap-3">
              <div class="text-xs text-gray-500 dark:text-gray-400">
                Vote n° {{ vote.id }} du {{ formatDate(vote.date) }}
              </div>
              <SocialShare :title="vote.name" :url="url" />
            </div>

            <!-- Title -->
            <h1 class="mb-4 text-lg font-bold text-gray-900 md:text-2xl dark:text-white">
              {{ vote.name }}
            </h1>

            <!-- Status Badge -->
            <span
              :class="[
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold',
                vote.status === 'adopted'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              ]"
            >
              <UIcon
                :name="vote.status === 'adopted' ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                class="h-4 w-4"
              />
              {{ vote.status === 'adopted' ? 'Adopté' : 'Rejeté' }}
            </span>
          </section>

          <!-- Vote Results Bar -->
          <section
            v-if="vote.voters_for !== null"
            class="rounded-2xl bg-white p-4 ring-1 ring-gray-100 md:p-6 dark:bg-gray-800 dark:ring-gray-700"
          >
            <h2 class="mb-3 text-sm font-bold text-gray-900 md:text-base dark:text-white">
              Résultats du scrutin
            </h2>

            <!-- Visual Bar -->
            <div class="mb-4 flex overflow-hidden rounded-xl">
              <!-- Pour (Vert) -->
              <div class="flex flex-1 flex-col items-center justify-center bg-emerald-500 py-3 text-white">
                <span class="text-xl font-bold md:text-2xl">{{ vote.voters_for ?? '-' }}</span>
                <span class="text-[10px] font-medium uppercase tracking-wider opacity-90">Pour</span>
              </div>
              <!-- Abstention (Jaune avec étoile verte - drapeau Sénégal) -->
              <div class="relative flex flex-1 flex-col items-center justify-center bg-amber-400 py-3 text-white">
                <span class="absolute inset-0 flex items-center justify-center text-4xl text-emerald-600/30">★</span>
                <span class="relative text-xl font-bold md:text-2xl">{{ vote.voters_abstention ?? '-' }}</span>
                <span class="relative text-[10px] font-medium uppercase tracking-wider opacity-90">Abstention</span>
              </div>
              <!-- Contre (Rouge) -->
              <div class="flex flex-1 flex-col items-center justify-center bg-red-500 py-3 text-white">
                <span class="text-xl font-bold md:text-2xl">{{ vote.voters_against ?? '-' }}</span>
                <span class="text-[10px] font-medium uppercase tracking-wider opacity-90">Contre</span>
              </div>
            </div>

            <!-- Summary -->
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Les députés ont
              <span :class="vote.status === 'adopted' ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'font-semibold text-red-600 dark:text-red-400'">
                {{ vote.status === 'adopted' ? 'adopté' : 'rejeté' }}
              </span>
              ce texte le {{ formatDate(vote.date) }}.
            </p>
          </section>

          <!-- Description -->
          <section
            v-if="vote.desc"
            class="rounded-2xl bg-white p-4 ring-1 ring-gray-100 md:p-6 dark:bg-gray-800 dark:ring-gray-700"
          >
            <h2 class="mb-3 text-sm font-bold text-gray-900 md:text-base dark:text-white">
              Description
            </h2>
            <div
              class="prose prose-sm prose-gray max-w-none dark:prose-invert"
              v-html="vote.desc"
            />
          </section>
        </template>
      </div>
    </main>

    <ScrollToTopButton />
  </div>
</template>

<script setup lang="ts">
const { siteName, siteUrl, themeColor } = useSiteMetadata();

const route = useRoute();
const id = computed(() => route.params.id as string);
const { vote, loading, error } = useAssemblyVotes({ id });

const url = computed(() => {
  if (!route.params.id) return siteUrl;
  return `${siteUrl}/assemblee-nationale/votes/${route.params.id}`;
});

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

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
    {
      '@type': 'ListItem',
      position: 4,
      name: vote.value?.name || 'Détail du vote',
      item: url.value,
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
