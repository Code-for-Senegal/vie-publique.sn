<script setup lang="ts">
import { useNews } from "~/composables/news/useNews";

const route = useRoute();
const config = useRuntimeConfig();
const { article, loading, error, fetchNewsById } = useNews();

const getImageUrl = (imageId: string) => {
  return `${config.public.cmsApiUrl}/assets/${imageId}`;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Chargement de l'article
onMounted(async () => {
  if (route.params.id) {
    await fetchNewsById(route.params.id as string);
  }
});

// SEO dynamique
useHead(() => {
  // N'exécuter que si l'article est chargé
  if (!article.value) return {};

  const description = `${article.value.title}. Publié le ${formatDate(article.value.date_published)}`;
  const imageUrl = article.value.cover_image
    ? `${config.public.cmsApiUrl}/assets/${article.value.cover_image}`
    : "/images/share-linkedin.png";

  return {
    title: article.value.title,
    meta: [
      { name: "description", content: description },
      { property: "og:title", content: article.value.title },
      { property: "og:description", content: description },
      { property: "og:image", content: imageUrl },
      { name: "twitter:title", content: article.value.title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
    ],
  };
});
</script>

<template>
  <div class="container mx-auto px-2 py-2">
    <!-- Bouton retour -->
    <NuxtLink
      to="/assemblee-nationale/actualites"
      class="mb-2 inline-flex items-center text-gray-600 hover:text-gray-800"
    >
      <UIcon name="i-heroicons-arrow-left" class="mr-2 h-5 w-5" />
      Retour aux actualités
    </NuxtLink>

    <!-- Loading state -->
    <div v-if="loading" class="space-y-4">
      <div class="h-8 w-3/4 animate-pulse rounded bg-gray-200"></div>
      <div class="h-64 animate-pulse rounded-lg bg-gray-200"></div>
      <div class="h-4 animate-pulse rounded bg-gray-200"></div>
      <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="rounded-lg bg-red-50 p-4 text-center text-red-500"
    >
      {{ error }}
    </div>

    <!-- Content -->
    <article v-else-if="article" class="mx-auto max-w-4xl">
      <header class="mb-4">
        <h1 class="mb-2 text-2xl font-bold text-gray-900 md:text-4xl">
          {{ article.title }}
        </h1>
        <div class="flex items-center gap-2 text-gray-500">
          <UIcon name="i-heroicons-calendar" class="h-5 w-5" />
          {{ formatDate(article.date_published) }}
        </div>
      </header>

      <!-- Image principale -->
      <img
        v-if="article.cover_image"
        :src="getImageUrl(article.cover_image)"
        :alt="article.title"
        class="mb-2 w-full rounded-lg object-contain shadow-sm"
        loading="lazy"
        fetchpriority="high"
      />

      <!-- Tags -->
      <div v-if="article.tags?.length" class="mb-8 flex hidden flex-wrap gap-2">
        <span
          v-for="tag in article.tags"
          :key="tag"
          class="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Contenu -->
      <div
        class="prose prose-lg prose-img:rounded-lg prose-a:text-blue-600 max-w-none"
        v-html="article.content"
      />
    </article>

    <!-- Not found state -->
    <div v-else class="py-12 text-center text-gray-500">Article non trouvé</div>
  </div>
</template>
