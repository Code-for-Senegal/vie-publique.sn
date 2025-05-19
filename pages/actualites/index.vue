//index.vue (page actualités)
<script setup lang="ts">
import { useNewsStore } from "~/stores/news";
import { useRoute } from "vue-router";

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

// Utilisation du store
const store = useNewsStore();

// Computed properties pour lier les valeurs du store
const searchQuery = computed({
  get: () => store.searchQuery,
  set: (value) => store.setSearchQuery(value),
});

const selectedCategory = computed({
  get: () => store.selectedCategory,
  set: (value) => store.setSelectedCategory(value),
});

// Chargement initial des données
onBeforeMount(async () => {
  await store.fetchNews();
});

// Recharger les données lors du changement de route
const route = useRoute();
watch(
  () => route.path,
  async () => {
    if (route.path === "/actualites") {
      await store.fetchNews();
    }
  },
);

// Fonction pour formater l'URL des articles
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

  if (categorySlug === "conseil-des-ministres") {
    return `/conseil-des-ministres/${id}/${slug}`;
  }

  if (categorySlug === "assemblee-nationale") {
    return `/assemblee-nationale/actualites/${id}/${slug}`;
  }

  return `/actualites/${id}/${slug}`;
};

// Ajout des couleurs pour les catégories
const getCategoryColor = (categoryName: string) => {
  const colorMap: Record<string, string> = {
    Toutes: "#6B7280", // gray-500
    "Conseil des ministres": "#1D4ED8", // blue-700
    "Conseil interministériel": "#7E22CE", // purple-700
    "Assemblée nationale": "#047857", // emerald-700
    Article: "#EA580C", // orange-600
    "Non catégorisé": "#4B5563", // gray-600
  };
  return colorMap[categoryName] || "#6B7280";
};
</script>

<template>
  <div class="container mx-auto">
    <div class="prose prose-sm sm:prose dark:prose-invert mx-auto my-2">
      <h1 class="text-center dark:text-white">Actualités</h1>
    </div>

    <!-- Filtres par catégorie -->
    <div class="mb-4">
      <!-- Barre de recherche -->
      <UInput
        v-model="searchQuery"
        size="md"
        placeholder="Rechercher..."
        icon="i-heroicons-magnifying-glass"
        class="input custom-shadow mb-4 w-full dark:bg-gray-800 dark:text-white"
        clearable
        :disabled="store.loading"
      />

      <!-- Skeleton pour les filtres pendant le chargement -->
      <div v-if="store.loading" class="flex flex-wrap gap-2">
        <div
          v-for="n in 5"
          :key="n"
          class="h-10 w-32 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
        ></div>
      </div>

      <!-- Liste des catégories -->
      <div v-else class="flex flex-wrap gap-2">
        <button
          v-for="category in store.categories"
          :key="category.name"
          @click="selectedCategory = category.name"
          class="flex items-center gap-1 rounded-full p-2 text-sm transition-colors duration-200"
          :class="{
            'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700':
              selectedCategory !== category.name,
            'text-white': selectedCategory === category.name,
          }"
          :style="{
            backgroundColor:
              selectedCategory === category.name
                ? getCategoryColor(category.name)
                : '',
          }"
        >
          <div
            class="h-3 w-3 rounded-full"
            :style="{
              backgroundColor: getCategoryColor(category.name),
              opacity: selectedCategory === category.name ? 1 : 0.3,
            }"
          ></div>
          {{ category.name }}
        </button>
      </div>
    </div>

    <!-- Skeleton loader pendant le chargement -->
    <div
      v-if="store.loading"
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div v-for="n in 6" :key="n" class="animate-pulse">
        <div class="relative w-full">
          <div
            class="aspect-[16/9] rounded-t-lg bg-gray-200 dark:bg-gray-700"
          ></div>
        </div>
        <div class="mt-4 space-y-3">
          <div class="h-6 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <UAlert
      v-else-if="store.error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      title="Erreur de chargement"
      :description="store.error"
    />

    <!-- Content -->
    <div v-else>
      <!-- Empty state -->
      <div
        v-if="
          !store.loading &&
          (!store.articles.length || store.paginatedNews.length === 0)
        "
        class="mt-8 flex flex-col items-center text-center text-gray-500 dark:text-gray-400"
      >
        <UIcon
          name="i-heroicons-exclamation-circle"
          class="mb-4 h-16 w-16 text-gray-400 dark:text-gray-500"
        />
        <p class="text-xl">Aucun résultat disponible</p>
      </div>

      <!-- News grid -->
      <div v-else-if="!store.loading">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <UCard
            v-for="article in store.paginatedNews"
            :key="article.id"
            class="custom-shadow group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border dark:border-gray-800 dark:bg-gray-900/50 dark:backdrop-blur-sm"
          >
            <NuxtLink :to="formatNewsUrl(article)" class="block">
              <div class="relative">
                <NuxtImg
                  :src="
                    article.cover_image
                      ? $directusImageUrl(article.cover_image, '50')
                      : '/default-image-2.gif'
                  "
                  :alt="article.title || 'Image actualité'"
                  class="h-48 w-full object-cover"
                  loading="lazy"
                  fetchpriority="high"
                  sizes="300px"
                  :placeholder="[300, 300]"
                />
                <div
                  class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4"
                >
                  <span
                    class="rounded-full px-3 py-1 text-xs font-medium text-white"
                    :style="{
                      backgroundColor: getCategoryColor(
                        article.category?.name || 'Non catégorisé',
                      ),
                    }"
                  >
                    {{ article.category?.name || "Non catégorisé" }}
                  </span>
                </div>
              </div>
              <div class="p-2">
                <h2
                  class="group-hover:text-primary line-clamp-2 font-semibold transition-colors dark:text-gray-100"
                >
                  {{ article.title }}
                </h2>
                <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {{ $dateformatWithDayName(article.date_published) }}
                </div>
              </div>
            </NuxtLink>
          </UCard>
        </div>

        <!-- Pagination -->
        <div v-if="store.totalPages > 1" class="mt-8 flex justify-center">
          <UPagination
            v-model="store.currentPage"
            :total="store.totalItems"
            :default-page="1"
            :show-edges="true"
            :sibling-count="2"
            :active-button="{ color: 'yellow' }"
            :ui="{
              wrapper: 'flex items-center gap-1',
              base: 'min-w-8 min-h-8 flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
              active: 'bg-gray-900 text-white dark:bg-gray-700',
              inactive:
                'bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
