<script setup lang="ts">
import { usePodcasts } from '~/composables/podcasts/usePodcasts';

const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const route = useRoute();

const { podcast, loading, error, refresh } = usePodcasts({
  id: route.params.id as string,
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      refresh();
    }
  },
);

const title = computed(() => {
  if (!podcast.value) return 'Chargement...';
  return `${podcast.value.title} | Podcasts Vie Publique Sénégal`;
});

const description = computed(() => {
  if (!podcast.value) return '';
  const plainText =
    podcast.value.description?.replace(/<[^>]*>/g, '') || podcast.value.title;
  const excerpt =
    plainText.length > 160 ? plainText.substring(0, 157) + '...' : plainText;
  return excerpt;
});

const url = computed(() => {
  if (!route.params.id || !route.params.slug) return siteUrl;
  return `${siteUrl}/podcasts/${route.params.id}/${route.params.slug}`;
});

const image = computed(() => {
  if (!podcast.value) return defaultImage;
  if (podcast.value.cover_image) return useCmsImageAbsolute(podcast.value.cover_image);
  const videoId = getYoutubeVideoId();
  if (videoId) return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  return defaultImage;
});

/**
 * Extrait l'ID YouTube depuis youtube_video_id ou youtube_url
 */
const getYoutubeVideoId = () => {
  if (!podcast.value) return null;
  if (podcast.value.youtube_video_id) return podcast.value.youtube_video_id;

  // Essayer d'extraire depuis youtube_url
  const url = podcast.value.youtube_url;
  if (!url) return null;

  // Format: youtube.com/watch?v=ID ou youtu.be/ID ou youtube.com/embed/ID
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // ID direct
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
};

const youtubeEmbedUrl = computed(() => {
  const videoId = getYoutubeVideoId();
  if (!videoId) return '';
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
});

const videoSchema = computed(() => {
  if (!podcast.value) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: podcast.value.title,
    description: description.value,
    thumbnailUrl: image.value,
    uploadDate: formatDateISO(podcast.value.date_published),
    duration: podcast.value.duration ? `PT${formatDurationISO(podcast.value.duration)}` : undefined,
    embedUrl: youtubeEmbedUrl.value,
    contentUrl: podcast.value.youtube_url,
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
    inLanguage: 'fr-SN',
    ...(podcast.value.view_count
      ? {
          interactionStatistic: {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/WatchAction',
            userInteractionCount: podcast.value.view_count,
          },
        }
      : {}),
  };
});

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
      name: 'Podcasts',
      item: `${siteUrl}/podcasts`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: podcast.value?.title || 'Podcast',
      item: url.value,
    },
  ],
}));

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatDateISO = (date: string) => {
  return new Date(date).toISOString();
};

/**
 * Convertit une durée "HH:MM:SS" ou "MM:SS" en format ISO 8601 (ex: "1H30M15S")
 */
const formatDurationISO = (duration: string) => {
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) {
    return `${parts[0]}H${parts[1]}M${parts[2]}S`;
  }
  if (parts.length === 2) {
    return `${parts[0]}M${parts[1]}S`;
  }
  return '';
};

const formatViews = (count?: number) => {
  if (!count) return '0';
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

// SEO setup
watch(
  [podcast, route],
  () => {
    if (podcast.value) {
      useSeoMeta({
        title: title.value,
        ogTitle: title.value,
        description: description.value,
        ogDescription: description.value,
        ogImage: image.value,
        ogUrl: url.value,
        ogType: 'video.other',
        twitterCard: 'summary_large_image',
        twitterTitle: title.value,
        twitterDescription: description.value,
        twitterImage: image.value,
        keywords: [
          ...keywords,
          ...(podcast.value.tags || []),
          'podcast Sénégal',
          'Vie Publique',
        ]
          .filter(Boolean)
          .join(', '),
      });

      useHead({
        htmlAttrs: { lang: 'fr-SN' },
        link: [{ rel: 'canonical', href: url.value }],
        meta: [
          { name: 'theme-color', content: themeColor },
          { name: 'author', content: siteName },
          { property: 'og:site_name', content: siteName },
          { property: 'og:video', content: youtubeEmbedUrl.value },
          { name: 'robots', content: 'index, follow' },
        ],
        script: [
          videoSchema.value
            ? {
                type: 'application/ld+json',
                children: JSON.stringify(videoSchema.value),
              }
            : null,
          {
            type: 'application/ld+json',
            children: JSON.stringify(breadcrumbSchema.value),
          },
        ].filter(Boolean),
      });
    }
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <div class="container mx-auto min-h-screen px-2 py-2 pb-16">
    <AppBreadcrumb :items="[
      { label: 'Podcasts', to: '/podcasts' },
      { label: podcast?.title || 'Podcast' }
    ]" />

    <!-- Loading state -->
    <div v-if="loading" class="mx-auto max-w-4xl space-y-4">
      <!-- Spinner -->
      <div class="flex flex-col items-center justify-center py-8">
        <div class="relative h-10 w-10">
          <div class="absolute inset-0 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500"></div>
        </div>
        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">Chargement du podcast...</p>
      </div>
      <!-- Skeleton -->
      <div class="h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      <div class="aspect-video animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      <div class="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      class="mt-4"
      title="Erreur"
      color="red"
      icon="i-heroicons-exclamation-triangle"
      description="Une erreur est survenue lors du chargement du podcast"
    />

    <!-- Content -->
    <article v-else-if="podcast" class="mx-auto max-w-4xl">
      <!-- Title -->
      <header class="mb-6">
        <h1 class="mb-3 text-2xl font-bold text-gray-900 md:text-4xl dark:text-white">
          {{ podcast.title }}
        </h1>
        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center gap-1">
            <UIcon name="i-heroicons-calendar" class="h-4 w-4" />
            <time :datetime="formatDateISO(podcast.date_published)">
              {{ formatDate(podcast.date_published) }}
            </time>
          </div>
          <div v-if="podcast.duration" class="flex items-center gap-1">
            <UIcon name="i-heroicons-clock" class="h-4 w-4" />
            {{ podcast.duration }}
          </div>
          <div v-if="podcast.view_count" class="flex items-center gap-1">
            <UIcon name="i-heroicons-eye" class="h-4 w-4" />
            {{ formatViews(podcast.view_count) }} vues
          </div>
        </div>
      </header>

      <!-- YouTube Embed -->
      <div v-if="youtubeEmbedUrl" class="mb-6 overflow-hidden rounded-xl shadow-lg">
        <iframe
          :src="youtubeEmbedUrl"
          :title="podcast.title"
          class="aspect-video w-full bg-black"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>

      <!-- Fallback when no YouTube embed -->
      <div v-else-if="podcast.youtube_url" class="mb-6">
        <a
          :href="podcast.youtube_url"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative block overflow-hidden rounded-xl"
        >
          <img
            :src="image"
            :alt="podcast.title"
            class="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div class="absolute inset-0 flex items-center justify-center bg-black/40">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg">
              <UIcon name="i-heroicons-play-solid" class="ml-1 h-8 w-8 text-white" />
            </div>
          </div>
        </a>
      </div>

      <!-- Lien YouTube direct -->
      <div class="mb-6">
        <a
          :href="podcast.youtube_url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <UIcon name="i-heroicons-play-solid" class="h-4 w-4" />
          Regarder sur YouTube
        </a>
      </div>

      <!-- Tags -->
      <div v-if="podcast.tags?.length" class="mb-6 flex flex-wrap gap-2">
        <span
          v-for="tag in podcast.tags"
          :key="tag"
          class="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Description -->
      <div
        v-if="podcast.description"
        class="prose prose-sm max-w-none sm:prose dark:prose-invert prose-a:text-blue-600 dark:prose-a:text-blue-400"
        v-html="podcast.description"
      />
    </article>

    <!-- Not found state -->
    <div v-else class="py-12 text-center text-gray-500 dark:text-gray-400">
      Podcast non trouvé
    </div>
  </div>
</template>
