<script setup lang="ts">
import { useNews } from "~/composables/news/useNews";
const { news, loading, error } = useNews({ category: "assemblee-nationale" });

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// SEO
useHead({
  title: "Actualités - Vie Publique",
  meta: [
    {
      name: "description",
      content: "Retrouvez toutes les actualités de la vie publique au Sénégal",
    },
  ],
});
</script>

<template>
  <div class="container mx-auto px-4 py-4">
    <NuxtLink
      to="/assemblee-nationale"
      class="mb-6 inline-flex items-center text-gray-600 hover:text-gray-800"
    >
      <UIcon name="i-heroicons-arrow-left" class="mr-2 h-5 w-5" />
      Retour aux actualités
    </NuxtLink>

    <div class="mx-auto max-w-7xl">
      <h1 class="mb-8 text-center text-3xl font-bold text-gray-900">
        Actualités Assemblée
      </h1>

      <!-- Loading state -->
      <div
        v-if="loading"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div v-for="n in 6" :key="n" class="animate-pulse">
          <div class="relative w-full">
            <div class="aspect-[16/9] rounded-t-lg bg-gray-200"></div>
          </div>
          <div class="mt-4 h-4 w-3/4 rounded bg-gray-200"></div>
          <div class="mt-2 h-3 w-1/4 rounded bg-gray-200"></div>
        </div>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="rounded-lg bg-red-50 p-4 text-center text-red-500"
      >
        {{ error }}
      </div>

      <!-- Content -->
      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="article in news"
          :key="article.id"
          :to="`/assemblee-nationale/actualites/${article.id}/${article.slug}`"
          class="group flex flex-col overflow-hidden rounded-lg bg-white shadow-xl transition-all"
        >
          <!-- Image Container avec ratio fixe -->
          <div class="relative w-full">
            <div class="aspect-[16/9] overflow-hidden">
              <img
                :src="$directusImageUrl(article.cover_image, '50')"
                :alt="article.title"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>

          <!-- Content -->
          <div class="flex flex-1 flex-col p-4">
            <h2
              class="mb-2 line-clamp-2 flex-grow text-lg font-semibold text-gray-900 group-hover:text-blue-600"
            >
              {{ article.title }}
            </h2>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <UIcon name="i-heroicons-calendar" class="h-4 w-4" />
              {{ formatDate(article.date_published) }}
            </div>

            <!-- Tags -->
            <div v-if="article.tags?.length" class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="tag in article.tags"
                :key="tag"
                class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty state -->
      <div
        v-if="!loading && !error && news.length === 0"
        class="py-12 text-center text-gray-500"
      >
        Aucun article disponible pour le moment
      </div>
    </div>
  </div>
</template>
