<script setup lang="ts">
import type { PodcastEpisode } from '~~/types/podcast';

interface Props {
  podcast: PodcastEpisode | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const embedUrl = computed(() => {
  if (!props.podcast?.youtube_video_id) return '';
  return `https://www.youtube-nocookie.com/embed/${props.podcast.youtube_video_id}?autoplay=1`;
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatViews = (count?: number) => {
  if (!count) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    emit('close');
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close');
  }
};

watch(
  () => props.podcast,
  (newVal, oldVal) => {
    if (newVal && !oldVal) {
      document.addEventListener('keydown', handleKeydown);
      document.body.style.overflow = 'hidden';
    } else if (!newVal && oldVal) {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = '';
    }
  },
);

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="podcast"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      @click="handleBackdropClick"
    >
      <div class="relative w-full max-w-4xl">
        <!-- Close button -->
        <button
          class="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Fermer"
          @click="emit('close')"
        >
          <UIcon name="i-heroicons-x-mark" class="h-5 w-5" />
        </button>

        <!-- Video player -->
        <div class="relative overflow-hidden rounded-lg" style="padding-bottom: 56.25%">
          <iframe
            :src="embedUrl"
            :title="podcast.title"
            class="absolute inset-0 h-full w-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>

        <!-- Info -->
        <div class="mt-4 text-white">
          <h3 class="text-lg font-semibold md:text-xl">{{ podcast.title }}</h3>
          <div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/70">
            <span>{{ formatDate(podcast.date_published) }}</span>
            <span v-if="podcast.duration">{{ podcast.duration }}</span>
            <span v-if="podcast.view_count">
              {{ formatViews(podcast.view_count) }} vues
            </span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
