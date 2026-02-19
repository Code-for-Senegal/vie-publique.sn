<script setup lang="ts">
import { usePodcasts } from '~/composables/podcasts/usePodcasts';
import type { PodcastEpisode } from '~~/types/podcast';

const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const title = 'Podcasts';
const description =
  "Retrouvez tous les podcasts de Vie Publique Sénégal. Lives, Spaces, interviews et débats sur la gouvernance, l'économie et la société sénégalaise.";
const url = `${siteUrl}/podcasts`;
const image = `${siteUrl}/images/share-linkedin.png`;

const PLAYLIST_URL =
  'https://www.youtube.com/playlist?list=PLeS2cIIeoLLBY-u5vVCxsCIM6ZHYp7ExM';

const podcastCollectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: title,
  description: description,
  url: url,
  image: image,
  isPartOf: {
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
  },
  mainEntity: {
    '@type': 'PodcastSeries',
    name: 'Podcast Vie Publique Sénégal',
    description: 'Lives, Spaces et interviews sur la vie publique au Sénégal',
    webFeed: PLAYLIST_URL,
  },
};

const breadcrumbSchema = {
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
      name: 'Podcasts',
      item: url,
    },
  ],
};

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: image,
  ogUrl: url,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  keywords: [
    ...keywords,
    'podcast Sénégal',
    'live Vie Publique',
    'interviews politique Sénégal',
    'débat citoyen Sénégal',
    'podcast gouvernance',
  ].join(', '),
});

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
    { name: 'robots', content: 'index, follow' },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(podcastCollectionSchema),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbSchema),
    },
  ],
});

const {
  podcasts,
  loading,
  error,
  searchQuery,
  selectedCategory,
  currentPage,
  totalPages,
  totalItems,
  featuredPodcasts,
} = usePodcasts();

// Typewriter effect pour les mots thématiques
const thematicWords = [
  'Gouvernance',
  'Économie',
  'Éducation',
  'Investissement',
  'Société',
  'Science',
  'Culture',
];

const { displayedText } = useTypewriter(thematicWords, {
  typingSpeed: 100,
  deletingSpeed: 50,
  pauseDuration: 2000,
});

// Player modal
const currentPodcast = ref<PodcastEpisode | null>(null);

const playPodcast = (podcast: PodcastEpisode) => {
  currentPodcast.value = podcast;
};

const closePlayer = () => {
  currentPodcast.value = null;
};
</script>

<template>
  <div class="container mx-auto min-h-screen px-4 pb-16 sm:px-6">
    <AppBreadcrumb
      class="mt-2"
      :items="[
        { label: 'Podcasts' }
      ]"
    />

    <!-- Hero Section -->
    <div
      class="relative overflow-hidden rounded-xl dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      <div class="relative py-8 md:py-12">
        <h1 class="max-w-2xl text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-5xl">
          Podcasts <span class="text-blue-600 dark:text-blue-600">Vie Publique</span>
        </h1>
        <p class="mt-4 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-blue-100 md:text-base">
          Retrouvez l'ensemble de nos Live/Spaces en replay.
          <span class="inline-flex items-baseline">
            <span class="font-semibold text-blue-600 dark:text-blue-600">{{ displayedText }}</span>
            <span class="typewriter-cursor ml-0.5 animate-pulse text-blue-600 dark:text-blue-600">|</span>
          </span>
          — un espace de dialogue citoyen.
        </p>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="space-y-8">
      <!-- Spinner central -->
      <div class="flex flex-col items-center justify-center py-12">
        <div class="relative h-12 w-12">
          <div class="absolute inset-0 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500"></div>
        </div>
        <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">Chargement des podcasts...</p>
      </div>

      <!-- Skeleton episodes récents -->
      <div>
        <div class="mb-4 h-7 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        <div class="flex gap-4 overflow-hidden">
          <div v-for="n in 4" :key="n" class="w-[280px] min-w-[280px] animate-pulse">
            <div class="aspect-video rounded-t-lg bg-gray-200 dark:bg-gray-700"></div>
            <div class="space-y-2 p-3">
              <div class="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
              <div class="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Skeleton grille -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        <div v-for="n in 8" :key="n" class="animate-pulse">
          <div class="aspect-video rounded-t-lg bg-gray-200 dark:bg-gray-700"></div>
          <div class="space-y-2 p-3">
            <div class="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
            <div class="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      title="Erreur de chargement"
      description="Une erreur est survenue lors du chargement des podcasts"
    />

    <!-- Content -->
    <div v-else>
      <!-- Empty state -->
      <div
        v-if="podcasts.length === 0"
        class="mt-8 flex flex-col items-center text-center text-gray-500 dark:text-gray-400"
      >
        <UIcon
          name="i-heroicons-microphone"
          class="mb-4 h-16 w-16 text-gray-400 dark:text-gray-500"
        />
        <p class="text-xl">Aucun podcast disponible</p>
        <p class="mt-2 text-sm">Revenez bientôt pour de nouveaux épisodes</p>
      </div>

      <div v-else class="space-y-10">
        <!-- Episodes à la une (featured) - Scroll horizontal -->
        <PodcastScrollRow
          v-if="featuredPodcasts.length > 0"
          title="À la une"
          :podcasts="featuredPodcasts.slice(0, 3)"
          :show-arrows="false"
          @play="playPodcast"
        />

        <!-- Tous les épisodes - Grille -->
        <section class="space-y-4">
          <h2 class="text-xl font-bold text-gray-900 md:text-2xl dark:text-white">
            {{
              selectedCategory === 'Toutes' && !searchQuery
                ? 'Tous les épisodes'
                : 'Résultats'
            }}
          </h2>

          <div
            class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
          >
            <PodcastCard
              v-for="podcast in podcasts"
              :key="podcast.id"
              :podcast="podcast"
              @play="playPodcast"
            />
          </div>
        </section>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-8 flex justify-center">
          <UPagination
            v-model="currentPage"
            :total="totalItems"
            :default-page="1"
            :show-edges="true"
            :sibling-count="2"
            :active-button="{ color: 'yellow' }"
            :ui="{
              wrapper: 'flex items-center gap-1',
              base: 'min-w-8 min-h-8 flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
              active: 'bg-gray-900 text-white dark:bg-gray-700',
              inactive:
                'bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
            }"
          />
        </div>
      </div>
    </div>

    <!-- Player Modal -->
    <PodcastPlayerModal :podcast="currentPodcast" @close="closePlayer" />
  </div>
</template>
