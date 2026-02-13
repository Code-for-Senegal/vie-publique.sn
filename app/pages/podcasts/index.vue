<script setup lang="ts">
import { usePodcasts } from '~/composables/podcasts/usePodcasts';
import type { PodcastEpisode } from '~~/types/podcast';

const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const title = 'Podcasts | Vie-Publique.sn';
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
  categories,
  setSearchQuery,
  setSelectedCategory,
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

// Modal d'invitation
const showInvitationModal = ref(false);

const handleInvitationSuccess = () => {
  // Optionnel: ajouter une notification ou un tracking
};

// Catégories avec "Toutes" en premier
const allCategories = computed(() => {
  const cats: { name: string; color?: string }[] = [{ name: 'Toutes' }];
  categories.value.forEach((cat) => {
    cats.push({ name: cat.name, color: cat.color || undefined });
  });
  return cats;
});

const getCategoryColor = (categoryName: string) => {
  if (categoryName === 'Toutes') return '#6B7280';
  const cat = allCategories.value.find((c) => c.name === categoryName);
  return cat?.color || '#6B7280';
};

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
  <div class="container mx-auto px-4 sm:px-6">
    <!-- Hero Section -->
    <div
      class="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      <div class="relative px-6 py-10 md:px-10 md:py-16">
        <div class="mb-3 flex items-center gap-3">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10"
          >
            <UIcon name="i-heroicons-microphone" class="h-6 w-6 text-white" />
          </div>
          <span class="text-xs font-medium uppercase tracking-widest text-blue-200">
            Vie Publique Sénégal
          </span>
        </div>
        <h1 class="max-w-2xl text-3xl font-bold leading-tight text-white md:text-5xl">
          Podcasts <span class="text-yellow-400">Vie Publique</span>
        </h1>
        <p class="mt-4 max-w-xl text-sm leading-relaxed text-blue-100 md:text-base">
          Retrouvez l'ensemble de nos Live/Spaces en replay.
          <span class="inline-flex items-baseline">
            <span class="font-semibold text-yellow-300">{{ displayedText }}</span>
            <span class="typewriter-cursor ml-0.5 animate-pulse text-yellow-300">|</span>
          </span>
          — un espace de dialogue citoyen.
        </p>
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <a
            :href="PLAYLIST_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <UIcon name="i-heroicons-play-solid" class="h-4 w-4" />
            Voir sur YouTube
          </a>

          <UButton
            color="yellow"
            variant="solid"
            size="md"
            @click="showInvitationModal = true"
          >
            <template #leading>
              <UIcon name="i-heroicons-user-plus" />
            </template>
            Être invité au podcast
          </UButton>

          <span v-if="totalItems > 0" class="text-sm text-blue-200">
            {{ totalItems }} épisodes
          </span>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="mb-6">
      <UInput
        :model-value="searchQuery"
        placeholder="Rechercher un podcast..."
        icon="i-heroicons-magnifying-glass"
        class="input custom-shadow mb-4 w-full dark:bg-gray-800 dark:text-white"
        size="lg"
        @update:model-value="setSearchQuery"
      />

      <!-- Skeleton pour les filtres -->
      <div v-if="loading" class="flex flex-wrap gap-2">
        <div
          v-for="n in 4"
          :key="n"
          class="h-10 w-28 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
        ></div>
      </div>

      <!-- Liste des catégories -->
      <div v-else class="flex flex-wrap gap-2">
        <button
          v-for="cat in allCategories"
          :key="cat.name"
          class="flex items-center gap-1 rounded-full p-2 text-sm transition-colors duration-200"
          :class="{
            'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700':
              selectedCategory !== cat.name,
            'text-white': selectedCategory === cat.name,
          }"
          :style="{
            backgroundColor:
              selectedCategory === cat.name ? getCategoryColor(cat.name) : '',
          }"
          @click="setSelectedCategory(cat.name)"
        >
          <div
            class="h-3 w-3 rounded-full"
            :style="{
              backgroundColor: getCategoryColor(cat.name),
              opacity: selectedCategory === cat.name ? 1 : 0.3,
            }"
          ></div>
          {{ cat.name }}
        </button>
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
          v-if="featuredPodcasts.length > 0 && selectedCategory === 'Toutes' && !searchQuery"
          title="À la une"
          :podcasts="featuredPodcasts"
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

    <!-- Invitation Modal -->
    <PodcastInvitationModal
      :is-open="showInvitationModal"
      @close="showInvitationModal = false"
      @success="handleInvitationSuccess"
    />
  </div>
</template>
