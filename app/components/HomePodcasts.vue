<script setup lang="ts">
import type { PodcastEpisode } from '~~/types/podcast';

const { data, pending, error } = useFetch('/api/podcasts', {
  key: 'home-podcasts-featured',
  query: { featured: 'true', limit: 3, sortBy: '-date_published' },
  lazy: true,
});

const featuredPodcasts = computed<PodcastEpisode[]>(() => {
  if (!data.value?.data) return [];
  return data.value.data as PodcastEpisode[];
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
  <div class="my-4">
    <!-- Loading state -->
    <div v-if="pending" class="space-y-4">
      <div class="h-7 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      <div
        class="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:gap-4 md:grid md:grid-cols-3 md:overflow-x-visible"
      >
        <div
          v-for="n in 3"
          :key="n"
          class="w-[240px] min-w-[240px] animate-pulse snap-start sm:w-[280px] sm:min-w-[280px] md:w-auto md:min-w-0"
        >
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
      title="Erreur"
      description="Une erreur est survenue lors du chargement des podcasts."
      color="red"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Content -->
    <div v-else-if="featuredPodcasts.length > 0">
      <PodcastScrollRow
        title="Podcasts à la une"
        :podcasts="featuredPodcasts"
        :show-arrows="false"
        @play="playPodcast"
      />

      <div class="mt-6 text-center">
        <NuxtLink
          to="/podcasts"
          class="group inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 transition-all duration-200 hover:bg-gray-50 hover:shadow-md hover:ring-gray-400 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700 dark:hover:ring-gray-600"
        >
          Voir tous les podcasts
          <UIcon
            name="i-heroicons-arrow-right"
            class="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
          />
        </NuxtLink>
      </div>
    </div>

    <!-- Player Modal -->
    <PodcastPlayerModal :podcast="currentPodcast" @close="closePlayer" />
  </div>
</template>
