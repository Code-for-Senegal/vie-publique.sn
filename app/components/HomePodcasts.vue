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
  <section class="my-4" aria-labelledby="podcasts-heading">
    <!-- Loading state -->
    <div v-if="pending" class="space-y-4" aria-busy="true">
      <USkeleton class="mx-auto h-7 w-48" />
      <div
        class="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-4 pt-1 md:grid md:grid-cols-3 md:gap-4 md:overflow-x-visible md:px-0 md:pb-0 md:pt-0"
      >
        <div
          v-for="n in 3"
          :key="n"
          class="w-60 flex-shrink-0 snap-start rounded-lg bg-white p-3 shadow-sm sm:w-72 md:w-auto md:flex-shrink dark:bg-gray-800"
        >
          <USkeleton class="aspect-video w-full rounded-md" />
          <div class="mt-3 space-y-2">
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-3 w-2/3" />
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

      <!-- CTA -->
      <div class="mt-6 text-center">
        <UButton
          to="/podcasts"
          color="gray"
          variant="solid"
          size="md"
          trailing-icon="i-heroicons-arrow-right"
          class="font-medium"
        >
          Voir tous les podcasts
        </UButton>
      </div>
    </div>

    <!-- Player Modal -->
    <PodcastPlayerModal :podcast="currentPodcast" @close="closePlayer" />
  </section>
</template>

<style scoped>
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
