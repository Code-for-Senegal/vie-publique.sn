<template>
  <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <li v-for="video in videos" :key="video.id">
      <NuxtLink
        :to="videoUrl(video)"
        :target="video.slug ? undefined : '_blank'"
        :rel="video.slug ? undefined : 'noopener'"
        class="group flex h-full flex-col overflow-hidden rounded-xl bg-white ring-1 ring-gray-100 transition-all active:scale-[0.99] dark:bg-gray-800 dark:ring-gray-700 md:hover:ring-gray-300"
      >
        <div class="relative aspect-video w-full overflow-hidden bg-gray-900">
          <img
            :src="thumbnail(video)"
            :alt="video.title"
            loading="lazy"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span class="absolute inset-0 flex items-center justify-center">
            <span
              class="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 backdrop-blur-sm"
            >
              <UIcon name="i-heroicons-play-solid" class="h-6 w-6 text-white" />
            </span>
          </span>
        </div>
        <div class="p-3">
          <h3 class="line-clamp-2 text-sm font-medium text-gray-900 dark:text-white">
            {{ video.title }}
          </h3>
        </div>
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { DossierLinkedPodcast } from '~~/types/dossier';

defineProps<{ videos: DossierLinkedPodcast[] }>();

const videoUrl = (video: DossierLinkedPodcast) => {
  if (video.slug) return `/podcasts/${video.slug}`;
  if (video.youtube_video_id) return `https://www.youtube.com/watch?v=${video.youtube_video_id}`;
  return '/podcasts';
};

const thumbnail = (video: DossierLinkedPodcast) => {
  if (video.cover_image) return useCmsImage(video.cover_image);
  if (video.youtube_video_id) {
    return `https://i.ytimg.com/vi/${video.youtube_video_id}/hqdefault.jpg`;
  }
  return '/default-image-2.gif';
};
</script>
