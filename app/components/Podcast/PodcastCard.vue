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
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '/default-image-2.gif';
});

const handlePlay = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  emit('play', props.podcast);
};
</script>

<template>
  <div
    class="group block cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/50"
    :class="variant === 'scroll' ? 'w-[240px] min-w-[240px] sm:w-[280px] sm:min-w-[280px] md:w-[300px] md:min-w-[300px] snap-start' : 'w-full'"
    @click="handlePlay"
  >
    <!-- Thumbnail -->
    <div class="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
      <CmsImage
        v-if="podcast.cover_image"
        :src="podcast.cover_image"
        :alt="podcast.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
      />
      <img
        v-else
        :src="thumbnailUrl"
        :alt="podcast.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      <!-- Play overlay -->
      <div
        class="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
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

      <!-- Category badge -->
      <span
        v-if="podcast.category"
        class="absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium text-white"
        :style="{ backgroundColor: podcast.category.color || '#6B7280' }"
      >
        {{ podcast.category.name }}
      </span>
    </div>

    <!-- Content -->
    <div class="space-y-2 p-3">
      <NuxtLink
        :to="podcastUrl"
        class="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition-colors hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-400"
        @click.stop
      >
        {{ podcast.title }}
      </NuxtLink>
      <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <UIcon name="i-heroicons-calendar" class="mr-1 h-3.5 w-3.5 shrink-0" />
        <span>{{ $dateformat(podcast.date_published) }}</span>
      </div>
    </div>
  </div>
</template>
