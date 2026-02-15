<template>
  <div
    class="group flex cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/50"
    :class="containerClass"
    @click="handlePlay"
  >
    <!-- Thumbnail -->
    <div
      class="relative flex items-center justify-center overflow-hidden bg-gray-900"
      :class="thumbnailClass"
    >
      <img
        :src="coverImageUrl"
        :alt="podcast.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        @error="handleImageError"
      />

      <!-- Play overlay -->
      <div
        class="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        :class="{ hidden: variant === 'grid' }"
      >
        <div
          class="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg"
        >
          <UIcon name="i-heroicons-play-solid" class="ml-0.5 h-6 w-6 text-white" />
        </div>
      </div>

      <!-- Duration badge -->
      <span
        v-if="podcast.duration"
        class="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm"
      >
        {{ podcast.duration }}
      </span>
    </div>

    <!-- Content -->
    <div class="flex flex-col justify-between p-3" :class="contentClass">
      <div class="space-y-1">
        <NuxtLink
          :to="podcastUrl"
          class="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition-colors hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-400"
          @click.stop
        >
          {{ podcast.title }}
        </NuxtLink>

        <!-- Mobile Description (Grid Variant only) -->
        <p
          v-if="variant === 'grid' && podcast.description"
          class="line-clamp-2 text-xs text-gray-500 dark:text-gray-400 sm:hidden"
        >
          {{ podcast.description }}
        </p>
      </div>

      <!-- Footer Info -->
      <div class="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <!-- Mobile Grid Footer (YouTube Style) -->
        <div v-if="variant === 'grid'" class="flex w-full items-center justify-between sm:hidden">
          <div class="flex items-center gap-1.5">
            <UIcon name="i-heroicons-link" class="h-3 w-3" />
            <span class="font-medium text-gray-400">youtube.com</span>
          </div>
          <UIcon name="i-heroicons-play-circle-solid" class="h-5 w-5 text-red-600" />
        </div>

        <!-- Desktop Grid Footer (Date) -->
        <div v-if="variant === 'grid'" class="hidden items-center sm:flex">
          <UIcon name="i-heroicons-calendar" class="mr-1 h-3.5 w-3.5 shrink-0" />
          <span>{{ $dateformat(podcast.date_published) }}</span>
        </div>

        <!-- Scroll variant Footer (Date) -->
        <div v-if="variant === 'scroll'" class="flex items-center">
          <UIcon name="i-heroicons-calendar" class="mr-1 h-3.5 w-3.5 shrink-0" />
          <span>{{ $dateformat(podcast.date_published) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PodcastEpisode } from '~~/types/podcast';

interface Props {
  podcast: PodcastEpisode;
  variant?: 'grid' | 'scroll';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'grid',
});

const emit = defineEmits<{
  play: [podcast: PodcastEpisode];
}>();

const podcastUrl = computed(() => {
  const slug =
    props.podcast.slug ||
    props.podcast.title
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') ||
    'podcast';
  return `/podcasts/${props.podcast.id}/${slug}`;
});

/**
 * Extrait l'ID YouTube depuis youtube_video_id ou youtube_url
 */
const getYoutubeVideoId = () => {
  if (props.podcast.youtube_video_id) return props.podcast.youtube_video_id;

  const url = props.podcast.youtube_url;
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
};

const thumbnailUrl = computed(() => {
  const videoId = getYoutubeVideoId();
  return videoId ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : '/default-image-2.gif';
});

// Image avec fallback sur YouTube thumbnail
const imageFailed = ref(false);

const coverImageUrl = computed(() => {
  // Si l'image CMS a échoué ou n'existe pas, utiliser YouTube thumbnail
  if (imageFailed.value || !props.podcast.cover_image) {
    return thumbnailUrl.value;
  }
  // Utiliser useCmsImage pour transformer l'ID en URL proxy
  return useCmsImage(props.podcast.cover_image);
});

const handleImageError = (event: Event) => {
  imageFailed.value = true;
  const img = event.target as HTMLImageElement;
  if (img) {
    img.src = thumbnailUrl.value;
  }
};

const handlePlay = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  emit('play', props.podcast);
};

// Computed classes for responsive layout
const containerClass = computed(() => {
  if (props.variant === 'scroll') {
    // Fixed width on mobile for horizontal scroll, auto width on desktop for grid
    return 'flex-col w-[240px] min-w-[240px] sm:w-[280px] sm:min-w-[280px] md:w-auto md:min-w-0 snap-start';
  }
  // Grid variant: Horizontal on mobile, Vertical on larger screens
  return 'flex-row sm:flex-col w-full h-32 sm:h-auto';
});

const thumbnailClass = computed(() => {
  if (props.variant === 'scroll') {
    return 'aspect-video w-full';
  }
  // Grid variant: Fixed width on mobile, full width on larger screens
  return 'w-32 shrink-0 sm:w-full sm:aspect-video h-full sm:h-auto';
});

const contentClass = computed(() => {
  if (props.variant === 'scroll') {
    return 'w-full';
  }
  // Grid variant: Take remaining width on mobile
  return 'flex-1 min-w-0 w-full';
});
</script>
