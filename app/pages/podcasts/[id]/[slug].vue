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
  const plainText = podcast.value.description?.replace(/<[^>]*>/g, '') || podcast.value.title;
  const excerpt = plainText.length > 160 ? plainText.substring(0, 157) + '...' : plainText;
  return excerpt;
});

const url = computed(() => {
  if (!route.params.id || !route.params.slug) return siteUrl;
  return `${siteUrl}/podcasts/${route.params.id}/${route.params.slug}`;
});

const image = computed(() => {
  if (!podcast.value) return defaultImage;
  if (podcast.value.cover_image) {
    const relativeUrl = useCmsImage(podcast.value.cover_image);
    return relativeUrl.startsWith('http') ? relativeUrl : `${siteUrl}${relativeUrl}`;
  }
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

// SEO setup — défini en scope setup avec des getters réactifs pour être rendu côté serveur
// (les crawlers sociaux ne lisent que le HTML SSR).
// NE PAS remettre dans un watch : pendant le SSR, un watch immédiat s'exécute avant que
// `podcast` soit chargé → les meta retombent sur les valeurs globales par défaut.
useSeoMeta({
  title: () => title.value,
  ogTitle: () => title.value,
  description: () => description.value,
  ogDescription: () => description.value,
  ogImage: () => image.value,
  ogImageAlt: () => podcast.value?.title || siteName,
  ogUrl: () => url.value,
  ogType: 'video.other',
  twitterCard: 'summary_large_image',
  twitterTitle: () => title.value,
  twitterDescription: () => description.value,
  twitterImage: () => image.value,
  keywords: () =>
    [...keywords, ...(podcast.value?.tags || []), 'podcast Sénégal', 'Vie Publique']
      .filter(Boolean)
      .join(', '),
});

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: () => [{ rel: 'canonical', href: url.value }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:site_name', content: siteName },
    { property: 'og:video', content: () => youtubeEmbedUrl.value },
    { name: 'robots', content: 'index, follow, max-image-preview:large' },
  ],
  script: () =>
    [
      videoSchema.value
        ? {
            type: 'application/ld+json',
            innerHTML: JSON.stringify(videoSchema.value),
          }
        : null,
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(breadcrumbSchema.value),
      },
    ].filter(Boolean),
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-24 dark:bg-gray-900">
    <!-- Sticky Header Mobile -->
    <div
      class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95 md:relative md:border-0 md:bg-transparent md:py-0 md:backdrop-blur-none dark:md:bg-transparent"
    >
      <div class="mx-auto max-w-4xl">
        <!-- Breadcrumb desktop only -->
        <div class="hidden pt-4 md:block">
          <AppBreadcrumb
            :items="[
              { label: 'Podcasts', to: '/podcasts' },
              { label: podcast?.title || 'Podcast' },
            ]"
          />
        </div>

        <div class="flex items-center gap-3 md:py-4">
          <!-- Back button mobile -->
          <NuxtLink
            to="/podcasts"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 active:scale-95 dark:bg-gray-700 md:hidden"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </NuxtLink>

          <div class="min-w-0 flex-1">
            <p class="truncate text-base font-semibold text-gray-900 dark:text-white md:hidden">
              {{ podcast?.title || 'Podcast' }}
            </p>
          </div>

          <SocialShare v-if="podcast" :title="podcast.title" :url="url" />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="mx-auto max-w-4xl px-4 pt-4">
      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <USkeleton class="aspect-video w-full rounded-2xl" />
        <USkeleton class="h-7 w-2/3" />
        <USkeleton class="h-5 w-1/3" />
        <USkeleton class="mt-4 h-32 w-full rounded-xl" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="rounded-2xl bg-red-50 p-6 text-center dark:bg-red-900/20">
        <div
          class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
        >
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="h-6 w-6 text-red-600 dark:text-red-400"
          />
        </div>
        <h3 class="font-medium text-red-800 dark:text-red-300">Erreur de chargement</h3>
        <p class="mt-1 text-sm text-red-600 dark:text-red-400">
          Une erreur est survenue lors du chargement du podcast
        </p>
        <NuxtLink
          to="/podcasts"
          class="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          Retour aux podcasts
        </NuxtLink>
      </div>

      <!-- Content -->
      <article v-else-if="podcast" class="space-y-5">
        <!-- Video Player -->
        <div class="overflow-hidden rounded-xl bg-black shadow-lg">
          <!-- YouTube Embed -->
          <div v-if="youtubeEmbedUrl" class="relative w-full" style="padding-bottom: 56.25%">
            <iframe
              :src="youtubeEmbedUrl"
              :title="podcast.title"
              class="absolute inset-0 h-full w-full"
              frameborder="0"
              allow="
                accelerometer;
                autoplay;
                clipboard-write;
                encrypted-media;
                gyroscope;
                picture-in-picture;
                web-share;
              "
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>

          <!-- Fallback si pas d'embed -->
          <a
            v-else-if="podcast.youtube_url"
            :href="podcast.youtube_url"
            target="_blank"
            rel="noopener noreferrer"
            class="group relative block"
          >
            <img
              :src="
                podcast.cover_image
                  ? useCmsImage(podcast.cover_image)
                  : getYoutubeVideoId()
                    ? `https://i.ytimg.com/vi/${getYoutubeVideoId()}/maxresdefault.jpg`
                    : '/default-image-2.gif'
              "
              :alt="podcast.title"
              class="aspect-video w-full object-cover"
            />
            <div class="absolute inset-0 flex items-center justify-center bg-black/40">
              <div
                class="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg transition-transform group-hover:scale-110"
              >
                <UIcon name="i-heroicons-play-solid" class="ml-1 h-7 w-7 text-white" />
              </div>
            </div>
          </a>
        </div>

        <!-- Podcast Info Card -->
        <div
          class="rounded-2xl bg-white p-5 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
        >
          <!-- Title (desktop only, mobile has it in sticky header) -->
          <h1 class="hidden text-xl font-bold text-gray-900 dark:text-white md:block md:text-2xl">
            {{ podcast.title }}
          </h1>

          <!-- Meta info -->
          <div class="flex flex-wrap items-center gap-3 text-sm md:mt-3">
            <time
              :datetime="formatDateISO(podcast.date_published)"
              class="text-gray-500 dark:text-gray-400"
            >
              {{ formatDate(podcast.date_published) }}
            </time>
            <span
              v-if="podcast.duration"
              class="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              <UIcon name="i-heroicons-clock" class="h-3.5 w-3.5" />
              {{ podcast.duration }}
            </span>
            <span
              v-if="podcast.view_count"
              class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"
            >
              <UIcon name="i-heroicons-eye" class="h-3.5 w-3.5" />
              {{ formatViews(podcast.view_count) }} vues
            </span>
          </div>

          <!-- Action button -->
          <div class="mt-4">
            <a
              v-if="podcast.youtube_url"
              :href="podcast.youtube_url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500"
            >
              <UIcon name="i-simple-icons-youtube" class="h-5 w-5" />
              Regarder sur YouTube
              <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-4 w-4 opacity-70" />
            </a>
          </div>

          <!-- Tags -->
          <div v-if="podcast.tags?.length" class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="tag in podcast.tags"
              :key="tag"
              class="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <!-- Description -->
        <div
          v-if="podcast.description"
          class="rounded-2xl bg-white p-5 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
        >
          <h2 class="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <UIcon
              name="i-heroicons-document-text"
              class="h-5 w-5 text-blue-600 dark:text-blue-400"
            />
            Description
          </h2>
          <div
            class="prose prose-sm max-w-none dark:prose-invert prose-p:text-gray-600 prose-a:text-blue-600 dark:prose-p:text-gray-300 dark:prose-a:text-blue-400"
            v-html="podcast.description"
          />
        </div>

        <!-- Back link -->
        <div class="pt-2">
          <NuxtLink
            to="/podcasts"
            class="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
            Voir tous les podcasts
          </NuxtLink>
        </div>
      </article>

      <!-- Not found -->
      <div
        v-else
        class="rounded-2xl bg-white p-8 text-center ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
      >
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
        >
          <UIcon name="i-heroicons-microphone" class="h-8 w-8 text-gray-400" />
        </div>
        <h3 class="font-medium text-gray-900 dark:text-white">Podcast non trouvé</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Ce podcast n'existe pas ou a été supprimé
        </p>
        <NuxtLink
          to="/podcasts"
          class="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          Retour aux podcasts
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
