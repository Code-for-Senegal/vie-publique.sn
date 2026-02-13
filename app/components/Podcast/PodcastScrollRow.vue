<script setup lang="ts">
import type { PodcastEpisode } from '~/types/podcast';

interface Props {
  title: string;
  podcasts: PodcastEpisode[];
}

defineProps<Props>();

const emit = defineEmits<{
  play: [podcast: PodcastEpisode];
}>();

const scrollRef = ref<HTMLDivElement>();

const scroll = (direction: 'left' | 'right') => {
  if (!scrollRef.value) return;
  const amount = 300;
  scrollRef.value.scrollBy({
    left: direction === 'left' ? -amount : amount,
    behavior: 'smooth',
  });
};
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900 md:text-2xl dark:text-white">
        {{ title }}
      </h2>
      <div class="hidden gap-2 md:flex">
        <button
          class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-100 transition-colors hover:bg-blue-700 hover:text-white dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-blue-600"
          aria-label="Défiler à gauche"
          @click="scroll('left')"
        >
          <UIcon name="i-heroicons-chevron-left" class="h-4 w-4" />
        </button>
        <button
          class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-100 transition-colors hover:bg-blue-700 hover:text-white dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-blue-600"
          aria-label="Défiler à droite"
          @click="scroll('right')"
        >
          <UIcon name="i-heroicons-chevron-right" class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div
      ref="scrollRef"
      class="scrollbar-hide -mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-2 pb-2 sm:gap-4"
    >
      <PodcastCard
        v-for="podcast in podcasts"
        :key="podcast.id"
        :podcast="podcast"
        variant="scroll"
        @play="emit('play', $event)"
      />
    </div>
  </section>
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
