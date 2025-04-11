<script lang="ts" setup>
import { useNews } from "~/composables/news/useNews";
const { news, loading, error, fetchNews } = useNews({ featured: true });

// Utiliser useRuntimeConfig pour accéder au mode dev
const config = useRuntimeConfig();
const isDev = process.dev; // Nuxt way to check dev mode

// Log pour débugger les valeurs réactives
// watchEffect(() => {
//   console.log("Current state:", {
//     loading: loading.value,
//     error: error.value,
//     newsLength: news.value?.length,
//     newsContent: news.value,
//   });
// });

// Fonction pour formater l'URL selon le nouveau format /categorie/id/slug
const formatNewsUrl = (article: any) => {
  if (!article) return "/actualites";

  const id = article.id;
  const slug =
    article.slug ||
    article.title
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

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

// Récupération des articles au montage du composant
onMounted(async () => {
  console.log("Component mounted, fetching news...");
  await fetchNews();
});
</script>

<template>
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

  <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <UCard
      v-for="article in news"
      :key="article.id"
      class="custom-shadow cursor-pointer"
    >
      <NuxtLink :to="formatNewsUrl(article)" class="flex flex-row sm:flex-col">
        <div class="mb-0 mr-4 w-1/3 sm:mb-4 sm:mr-0 sm:w-full">
          <NuxtImg
            :src="$directusImageUrl(article.cover_image, '50')"
            :alt="article.title"
            class="h-24 w-full object-cover sm:h-48"
            loading="lazy"
            fetchpriority="high"
            sizes="300px"
            :placeholder="[300, 300]"
          />
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold sm:text-base">
            {{ article.title }}
          </p>
          <div v-if="article.date_published" class="text-sm text-gray-800">
            {{ $dateformatWithDayName(article.date_published) }}
          </div>
        </div>
      </NuxtLink>
    </UCard>
  </div>
</template>
