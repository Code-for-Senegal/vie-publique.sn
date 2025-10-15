<script lang="ts" setup>
import { useNews } from "~/composables/news/useNews";

// Fonction pour formater l'URL selon le nouveau format /categorie/id/slug
const formatNewsUrl = (article: {
  id: string;
  title?: string;
  slug?: string;
  category?: {
    slug?: string;
  };
}) => {
  if (!article) return "/actualites";

  const id = article.id;
  const slug =
    article.slug ||
    (article.title
      ? article.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      : "actualite");

  // Gestion spécifique selon la catégorie
  const categorySlug = article.category?.slug;

  // Cas du conseil des ministres
  if (categorySlug === "conseil-des-ministres") {
    return `/conseil-des-ministres/${id}/${slug}`;
  }

  // Cas de l'assemblée nationale
  if (categorySlug === "assemblee-nationale") {
    return `/assemblee-nationale/actualites/${id}/${slug}`;
  }

  // Cas par défaut pour toutes les autres catégories
  return `/actualites/${id}/${slug}`;
};

const {
  articles: featuredNews,
  error,
  loading,
} = useNews({
  featured: true,
  limit: 3,
});
</script>

<template>
  <div class="my-4">
    <div class="prose prose-sm sm:prose mx-auto my-4">
      <h2 class="text-center text-gray-800 dark:text-white">À la une</h2>
    </div>

    <div
      v-if="loading"
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div v-for="n in 3" :key="n" class="animate-pulse">
        <div class="relative w-full">
          <div class="aspect-[16/9] rounded-t-lg bg-gray-200"></div>
        </div>
        <div class="mt-4 h-4 w-3/4 rounded bg-gray-200"></div>
        <div class="mt-2 h-3 w-1/4 rounded bg-gray-200"></div>
      </div>
    </div>

    <div v-else-if="error" class="p-4 text-red-600">
      Une erreur est survenue lors du chargement des actualités.
    </div>

    <div v-else>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <UCard
          v-for="article in featuredNews?.slice(0, 3)"
          :key="article.id"
          class="custom-shadow cursor-pointer"
        >
          <NuxtLink
            :to="formatNewsUrl(article)"
            class="flex flex-row sm:flex-col"
          >
            <div class="mb-0 mr-4 w-1/3 sm:mb-4 sm:mr-0 sm:w-full">
              <CmsImage
                :src="article.cover_image"
                :fallback="'/default-image-2.gif'"
                :alt="article.title || 'Image actualité'"
                class="h-20 w-full object-cover sm:h-48"
                sizes="300px"
                :placeholder="[300, 300]"
              />
            </div>
            <div class="flex-1">
              <p class="line-clamp-2 text-sm font-semibold sm:text-base">
                {{ article.title }}
              </p>
              <div
                v-if="article.date_published"
                class="text-sm text-gray-800 dark:text-slate-200"
              >
                {{ $dateformatWithDayName(article.date_published) }}
              </div>
            </div>
          </NuxtLink>
        </UCard>
      </div>
      <div class="mt-4 text-center">
        <NuxtLink
          to="/actualites"
          class="inline-flex items-center gap-2 text-sm font-medium text-green-700 underline"
        >
          Voir toutes les actualités
          <UIcon name="i-heroicons-arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
