<template>
  <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <li v-for="item in news" :key="item.id">
      <NuxtLink
        :to="newsUrl(item)"
        class="group flex h-full flex-col overflow-hidden rounded-xl bg-white ring-1 ring-gray-100 transition-all active:scale-[0.99] dark:bg-gray-800 dark:ring-gray-700 md:hover:ring-gray-300"
      >
        <div class="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
          <CmsImage
            :src="item.cover_image"
            :alt="item.title"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span
            v-if="item.category"
            class="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
          >
            {{ item.category }}
          </span>
        </div>
        <div class="flex flex-1 flex-col p-3">
          <h3 class="line-clamp-3 text-sm font-medium text-gray-900 dark:text-white">
            {{ item.title }}
          </h3>
          <p v-if="item.date_published" class="mt-auto pt-2 text-xs text-gray-400">
            {{ formatDate(item.date_published) }}
          </p>
        </div>
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { DossierLinkedNews } from '~~/types/dossier';

defineProps<{ news: DossierLinkedNews[] }>();

const newsUrl = (item: DossierLinkedNews) => {
  const base = item.category === 'Conseil des ministres' ? '/conseil-des-ministres' : '/actualites';
  return `${base}/${item.id}/${item.slug || ''}`;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
</script>
