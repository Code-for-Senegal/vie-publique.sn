<script setup lang="ts">
import { usePodcasts } from '~/composables/podcasts/usePodcasts';
import type { PodcastEpisode } from '~~/types/podcast';

const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const title = 'Podcasts';
const description =
  "Retrouvez tous les podcasts de Vie Publique Sénégal. Lives, Spaces, interviews et débats sur la gouvernance, l'économie et la société sénégalaise.";
const url = `${siteUrl}/podcasts`;
const image = `${siteUrl}/images/share-linkedin.png`;

const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLeS2cIIeoLLBY-u5vVCxsCIM6ZHYp7ExM';

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
      innerHTML: JSON.stringify(podcastCollectionSchema),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(breadcrumbSchema),
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
  itemsPerPage,
  featuredPodcasts,
} = usePodcasts({ limit: 25 });

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

// Featured podcast (le plus récent) - uniquement sur la page 1
const featuredPodcast = computed(() => {
  if (currentPage.value !== 1) return null;
  return podcasts.value?.[0] || null;
});

// Recent podcasts (les 3 suivants) - uniquement sur la page 1
const recentPodcasts = computed(() => {
  if (currentPage.value !== 1) return [];
  return podcasts.value?.slice(1, 4) || [];
});

// All other podcasts
const otherPodcasts = computed(() => {
  if (currentPage.value === 1) {
    // Sur la page 1, on saute le featured (1) et les récents (3)
    return podcasts.value?.slice(4) || [];
  }
  // Sur les autres pages, on affiche tout le contenu de la page
  return podcasts.value || [];
});

// Get YouTube thumbnail
const getYoutubeThumbnail = (podcast: PodcastEpisode) => {
  const videoId = podcast.youtube_video_id || extractYoutubeId(podcast.youtube_url);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : '/default-image-2.gif';
};

const extractYoutubeId = (url?: string) => {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
  );
  return match?.[1] || null;
};

const getPodcastUrl = (podcast: PodcastEpisode) => {
  const slug =
    podcast.slug ||
    podcast.title
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') ||
    'podcast';
  return `/podcasts/${podcast.id}/${slug}`;
};
</script>

<template>
  <div class="min-h-screen bg-white pb-24 dark:bg-gray-950">
    <!-- Sticky Header (Mobile only) -->
    <div
      class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95 md:hidden"
    >
      <div class="flex items-center gap-3 px-4 py-3">
        <NuxtLink
          to="/"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 active:scale-95 dark:bg-gray-700"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </NuxtLink>

        <p class="flex-1 truncate text-base font-semibold text-gray-900 dark:text-white">
          Podcasts
        </p>

        <a
          :href="PLAYLIST_URL"
          target="_blank"
          class="flex h-9 items-center gap-2 rounded-full bg-red-600 px-3 text-sm font-medium text-white active:scale-95"
        >
          <UIcon name="i-simple-icons-youtube" class="h-4 w-4" />
        </a>
      </div>
    </div>

    <!-- Hero Featured Podcast -->
    <div v-if="!loading && featuredPodcast" class="relative">
      <!-- Background Image with Overlay -->
      <div class="absolute inset-0 h-[420px] overflow-hidden md:h-[480px]">
        <img
          :src="
            featuredPodcast.cover_image
              ? useCmsImage(featuredPodcast.cover_image)
              : getYoutubeThumbnail(featuredPodcast)
          "
          :alt="featuredPodcast.title"
          class="h-full w-full object-cover"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/40 dark:from-gray-950 dark:via-gray-950/80 dark:to-gray-950/40"
        ></div>
        <div
          class="absolute inset-0 bg-gradient-to-r from-white/90 via-transparent to-transparent dark:from-gray-950/90"
        ></div>
      </div>

      <!-- Content -->
      <div class="relative mx-auto max-w-6xl px-4 pb-8 pt-6">
        <!-- Desktop Navigation with AppBreadcrumb -->
        <div class="mb-6 hidden items-center justify-between md:flex">
          <AppBreadcrumb :items="[{ label: 'Podcasts' }]" />
          <a
            :href="PLAYLIST_URL"
            target="_blank"
            class="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:bg-red-500"
          >
            <UIcon name="i-simple-icons-youtube" class="h-4 w-4" />
            <span>YouTube</span>
          </a>
        </div>

        <!-- Featured Content -->
        <div class="mt-20 md:mt-24">
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-white/70">
            <span class="rounded bg-blue-500 px-2 py-0.5 text-xs font-medium text-white"
              >DERNIER ÉPISODE</span
            >
            <span>{{ $dateformat(featuredPodcast.date_published) }}</span>
            <span v-if="featuredPodcast.duration">• {{ featuredPodcast.duration }}</span>
          </div>

          <h1
            class="mt-3 max-w-2xl text-2xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl"
          >
            {{ featuredPodcast.title }}
          </h1>

          <div
            v-if="featuredPodcast.description"
            class="mt-3 line-clamp-2 max-w-xl text-sm text-gray-600 dark:text-white/70 md:text-base [&>p]:m-0 [&>p]:inline"
            v-html="featuredPodcast.description"
          />

          <div class="mt-6 flex flex-wrap items-center gap-3">
            <button
              class="group flex items-center gap-3 rounded-full bg-gray-900 px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              @click="playPodcast(featuredPodcast)"
            >
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 transition-transform group-hover:scale-110"
              >
                <UIcon name="i-heroicons-play-solid" class="ml-0.5 h-4 w-4 text-white" />
              </div>
              Écouter maintenant
            </button>
            <NuxtLink
              :to="getPodcastUrl(featuredPodcast)"
              class="flex items-center gap-2 rounded-full border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/30 dark:text-white dark:hover:bg-white/10"
            >
              <UIcon name="i-heroicons-information-circle" class="h-5 w-5" />
              En savoir plus
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Hero -->
    <div
      v-else-if="loading && currentPage === 1"
      class="relative h-[420px] bg-gray-100 dark:bg-gray-900 md:h-[480px]"
    >
      <div
        class="absolute inset-0 bg-gradient-to-t from-white via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800"
      ></div>
      <div class="relative mx-auto max-w-6xl px-4 pt-16 md:pt-6">
        <!-- Desktop Navigation Skeleton -->
        <div class="mb-8 hidden items-center justify-between md:flex">
          <USkeleton class="h-10 w-10 rounded-full" />
          <USkeleton class="h-10 w-28 rounded-full" />
        </div>
        <div class="mt-44 space-y-4 md:mt-36">
          <USkeleton class="h-6 w-40" />
          <USkeleton class="h-10 w-96" />
          <USkeleton class="h-5 w-80" />
          <div class="flex gap-3 pt-4">
            <USkeleton class="h-12 w-48 rounded-full" />
            <USkeleton class="h-12 w-36 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="mx-auto max-w-6xl px-4">
      <!-- Breadcrumb for other pages -->
      <div v-if="currentPage > 1" class="py-6">
        <AppBreadcrumb :items="[{ label: 'Podcasts' }]" />
      </div>
      <!-- Recent Episodes Section -->
      <section v-if="!loading && recentPodcasts.length > 0" class="py-6">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Récents</h3>
        </div>

        <div class="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
          <div
            v-for="podcast in recentPodcasts"
            :key="podcast.id"
            class="group w-[200px] min-w-[200px] cursor-pointer sm:w-[240px] sm:min-w-[240px]"
            @click="playPodcast(podcast)"
          >
            <div class="relative aspect-video overflow-hidden rounded-xl">
              <img
                :src="
                  podcast.cover_image
                    ? useCmsImage(podcast.cover_image)
                    : getYoutubeThumbnail(podcast)
                "
                :alt="podcast.title"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div
                class="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40"
              >
                <div
                  class="flex h-12 w-12 scale-0 items-center justify-center rounded-full bg-white transition-transform group-hover:scale-100"
                >
                  <UIcon name="i-heroicons-play-solid" class="ml-0.5 h-5 w-5 text-gray-900" />
                </div>
              </div>
              <span
                v-if="podcast.duration"
                class="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
              >
                {{ podcast.duration }}
              </span>
            </div>
            <NuxtLink :to="getPodcastUrl(podcast)" class="mt-2 block" @click.stop>
              <h4
                class="line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
              >
                {{ podcast.title }}
              </h4>
            </NuxtLink>
            <time class="mt-1 text-xs text-gray-500 dark:text-white/50">{{
              $dateformat(podcast.date_published)
            }}</time>
          </div>
        </div>
      </section>

      <!-- Error State -->
      <div v-if="error" class="py-12">
        <div class="rounded-2xl bg-red-50 p-8 text-center dark:bg-red-500/10">
          <div
            class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20"
          >
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="h-7 w-7 text-red-500 dark:text-red-400"
            />
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Erreur de chargement</h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-white/60">
            Une erreur est survenue lors du chargement des podcasts
          </p>
        </div>
      </div>

      <!-- Loading Grid -->
      <div v-else-if="loading" class="grid grid-cols-2 gap-4 py-6 sm:grid-cols-3 lg:grid-cols-4">
        <div v-for="n in 8" :key="n" class="space-y-3">
          <USkeleton class="aspect-video w-full rounded-xl" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-3 w-2/3" />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="podcasts.length === 0" class="py-16">
        <div class="text-center">
          <div
            class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5"
          >
            <UIcon
              name="i-heroicons-microphone"
              class="h-10 w-10 text-gray-400 dark:text-white/40"
            />
          </div>
          <h3 class="text-xl font-medium text-gray-900 dark:text-white">
            Aucun podcast disponible
          </h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-white/60">
            Revenez bientôt pour de nouveaux épisodes
          </p>
        </div>
      </div>

      <!-- All Episodes Grid -->
      <section v-else-if="otherPodcasts.length > 0" class="py-6">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Tous les épisodes</h3>
        </div>

        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <div
            v-for="podcast in otherPodcasts"
            :key="podcast.id"
            class="group cursor-pointer"
            @click="playPodcast(podcast)"
          >
            <div
              class="relative aspect-video overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
            >
              <img
                :src="
                  podcast.cover_image
                    ? useCmsImage(podcast.cover_image)
                    : getYoutubeThumbnail(podcast)
                "
                :alt="podcast.title"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div
                class="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40"
              >
                <div
                  class="flex h-10 w-10 scale-0 items-center justify-center rounded-full bg-white transition-transform group-hover:scale-100"
                >
                  <UIcon name="i-heroicons-play-solid" class="ml-0.5 h-4 w-4 text-gray-900" />
                </div>
              </div>
              <span
                v-if="podcast.duration"
                class="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
              >
                {{ podcast.duration }}
              </span>
            </div>
            <NuxtLink :to="getPodcastUrl(podcast)" class="mt-2 block" @click.stop>
              <h4
                class="line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
              >
                {{ podcast.title }}
              </h4>
            </NuxtLink>
            <time class="mt-1 text-xs text-gray-500 dark:text-white/50">{{
              $dateformat(podcast.date_published)
            }}</time>
          </div>
        </div>
      </section>

      <!-- Pagination -->
      <div
        v-if="!loading && totalPages > 1"
        class="flex justify-center border-t border-gray-200 py-8 dark:border-white/10"
      >
        <UPagination
          v-model="currentPage"
          :total="totalItems"
          :page-count="itemsPerPage"
          :default-page="1"
          :show-edges="true"
          :sibling-count="1"
          :ui="{
            wrapper: 'flex items-center gap-2',
            base: 'min-w-10 min-h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all',
            active: 'bg-gray-900 text-white dark:bg-white dark:text-gray-900',
            inactive:
              'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20',
          }"
        />
      </div>
    </div>

    <!-- Player Modal -->
    <PodcastPlayerModal :podcast="currentPodcast" @close="closePlayer" />
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
