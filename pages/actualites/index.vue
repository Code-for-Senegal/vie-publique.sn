//index.vue (page actualités)
<script setup lang="ts">
import { useNews } from "~/composables/news/useNews";

// Configuration des métadonnées pour le SEO et le partage social
const seoTitle = "Actualités de la république du Sénégal";
const seoDescription = "Information Actualités de la république du Sénégal";
const seoImgPath = "https://vie-publique.sn/images/share-linkedin.png";
const seoPageUrl = "https://vie-publique.sn/actualites";

useHead({
  title: seoTitle,
  meta: [
    {
      name: "description",
      content: seoDescription,
    },
    // Twitter Card Meta Tags
    { name: "twitter:title", content: seoTitle },
    { name: "twitter:description", content: seoDescription },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: seoImgPath },
    // Open Graph Meta Tags
    { property: "og:title", content: seoTitle },
    { property: "og:description", content: seoDescription },
    { property: "og:image", content: seoImgPath },
    { property: "og:url", content: seoPageUrl },
    { property: "og:type", content: "website" },
  ],
});

// État local
const searchQuery = ref("");
const selectedCategory = ref("Toutes");

// Utilisation du composable useNews
const { news, loading, error, fetchNews } = useNews();

// Chargement initial des données
onMounted(() => {
  fetchNews();
});

// Calcul des catégories uniques avec comptage
const categoriesWithCount = computed(() => {
  if (!news.value?.length) return [{ name: "Toutes", count: 0 }];

  const categoryCounts = news.value.reduce((acc, item) => {
    const categoryName = item.category?.name || "Non catégorisé";
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {});

  const allCount = news.value.length;

  return [
    { name: "Toutes", count: allCount },
    ...Object.entries(categoryCounts).map(([name, count]) => ({ name, count })),
  ];
});

// Filtrage et tri des actualités
const filteredSortedNews = computed(() => {
  if (!news.value) return [];

  return news.value
    .filter((article) => {
      const matchesSearch = article.title
        ?.toLowerCase()
        .includes(searchQuery.value.toLowerCase());
      const matchesCategory =
        selectedCategory.value === "Toutes" ||
        article.category?.name === selectedCategory.value;

      return matchesSearch && matchesCategory;
    })
    .sort(
      (a, b) =>
        new Date(b.date_published).getTime() -
        new Date(a.date_published).getTime(),
    );
});

// Fonction pour formater l'URL des articles
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

  if (categorySlug === "conseil-des-ministres") {
    return `/conseil-des-ministres/${id}/${slug}`;
  }

  if (categorySlug === "assemblee-nationale") {
    return `/assemblee-nationale/actualites/${id}/${slug}`;
  }

  return `/actualites/${id}/${slug}`;
};
</script>

<template>
  <div class="container mx-auto">
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Actualités</h1>
    </div>

    <!-- Filtres par catégorie -->
    <div class="mb-4 flex flex-wrap justify-center gap-2">
      <UButton
        v-for="category in categoriesWithCount"
        :key="category.name"
        :color="selectedCategory === category.name ? 'primary' : 'gray'"
        class="rounded-none border-0 text-sm shadow-md transition-all duration-300 ease-in-out"
        size="sm"
        @click="selectedCategory = category.name"
      >
        {{ category.name }} ({{ category.count }})
      </UButton>
    </div>

    <!-- Barre de recherche -->
    <UInput
      v-model="searchQuery"
      size="md"
      placeholder="Rechercher..."
      icon="i-heroicons-magnifying-glass"
      class="input custom-shadow my-4 w-full"
    />

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

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      title="Erreur de chargement"
      :description="error"
    />

    <!-- Content -->
    <div v-else>
      <!-- Empty state -->
      <div
        v-if="filteredSortedNews.length === 0"
        class="mt-8 flex flex-col items-center text-center text-gray-500"
      >
        <UIcon
          name="i-heroicons-exclamation-circle"
          class="mb-4 h-16 w-16 text-gray-400"
        />
        <p class="text-xl">Aucun résultat disponible</p>
      </div>

      <!-- News grid -->
      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="article in filteredSortedNews"
          :key="article.id"
          class="custom-shadow cursor-pointer"
        >
          <NuxtLink :to="formatNewsUrl(article)">
            <img
              :src="
                $directusImageUrl(article.cover_image, '50') ||
                '/default-image-2.gif'
              "
              :alt="article.title"
              class="mb-4 h-48 w-full object-cover"
            />
            <div
              class="siteweb-type my-1 inline-block bg-gray-200 px-2 py-1 text-xs text-gray-800"
            >
              {{ article.category?.name }}
            </div>
            <div class="text-sm text-gray-800">
              {{ $dateformatWithDayName(article.date_published) }}
            </div>
            <p class="font-semibold">
              {{ article.title }}
            </p>
          </NuxtLink>
        </UCard>
      </div>
    </div>
  </div>
</template>
