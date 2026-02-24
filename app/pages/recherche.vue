<script setup lang="ts">
// Configuration SEO
useHead({
  title: "Recherche Avancée - Vie-Publique.sn",
  meta: [
    {
      name: "description",
      content:
        "Recherche avancée dans les actualités et documents officiels de la République du Sénégal avec filtres et fonctionnalités étendues",
    },
  ],
});

// Utilisation du composable de recherche amélioré
const {
  searchQuery,
  searchResults,
  totalResults,
  totalIndexed,
  loading,
  currentPage,
  hasSearched,
  selectedTypes,
  performSearch,
  totalPages,
  toggleType,
  resultCountsByType,
} = useSearchEnhanced();

// Types disponibles pour les filtres
const availableTypes = [
  {
    value: "document",
    label: "Documents",
    icon: "i-heroicons-document-text",
    color:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
  },
  {
    value: "actualite",
    label: "Actualités",
    icon: "i-heroicons-newspaper",
    color:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700",
  },
];

// Fonction pour formater les dates Unix timestamp (sans le jour de la semaine)
const formatUnixDate = (timestamp: number | string) => {
  if (!timestamp) return "";
  const ts = typeof timestamp === "string" ? parseInt(timestamp) : timestamp;
  const date = new Date(ts * 1000);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleDateString("fr-FR", options);
};

// Fonction pour effacer tous les filtres (commentée car non utilisée)
// const clearAllFilters = () => {
//   selectedTypes.value = [];
// };

// Fonction pour obtenir la couleur du badge selon le type
const getBadgeColor = (type: string) => {
  if (type === "document") {
    return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
  } else if (type === "actualite") {
    return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700";
  }
  // Couleur par défaut pour les autres types
  return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
};

// Composant Skeleton pour les résultats - défini dans le template
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-900">
    <!-- Breadcrumb -->
    <div class="container mx-auto px-4 pt-4">
      <AppBreadcrumb :items="[{ label: 'Recherche' }]" />
    </div>

    <!-- Sticky Header mobile -->
    <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm md:relative md:border-0 md:bg-transparent md:backdrop-blur-none dark:border-gray-800 dark:bg-gray-900/95">
      <div class="container mx-auto px-4 py-3 md:py-6">
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 md:hidden dark:bg-gray-800"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </NuxtLink>
          <div class="min-w-0 flex-1">
            <h1 class="text-lg font-bold text-gray-900 md:text-2xl dark:text-white">
              Recherche
            </h1>
            <p v-if="totalIndexed" class="hidden text-xs text-gray-500 md:block dark:text-gray-400">
              {{ totalIndexed }} documents indexés
            </p>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-4">
      <!-- Barre de recherche -->
      <div class="mb-4">
        <div class="relative">
          <UIcon
            name="i-heroicons-magnifying-glass"
            class="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher documents, actualités..."
            class="h-12 w-full rounded-xl border-0 bg-white pl-11 pr-20 text-sm ring-1 ring-gray-200 transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:placeholder:text-gray-500"
            @keyup.enter="performSearch"
          />
          <div class="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            <button
              v-if="searchQuery"
              class="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="searchQuery = ''"
            >
              <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
            </button>
            <button
              v-if="searchQuery.trim()"
              :disabled="loading"
              class="flex h-8 items-center gap-1.5 rounded-full bg-sky-500 px-3 text-xs font-medium text-white transition-colors hover:bg-sky-600 disabled:opacity-50"
              @click="performSearch"
            >
              <UIcon v-if="loading" name="i-heroicons-arrow-path" class="h-3.5 w-3.5 animate-spin" />
              <span>Rechercher</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="mb-4 flex gap-2">
        <button
          v-for="type in availableTypes"
          :key="type.value"
          :class="[
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95',
            selectedTypes.includes(type.value)
              ? type.color
              : 'bg-white text-gray-600 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700'
          ]"
          @click="toggleType(type.value)"
        >
          <UIcon :name="type.icon" class="h-3.5 w-3.5" />
          <span>{{ type.label }}</span>
          <span
            v-if="hasSearched && resultCountsByType[type.value] > 0"
            class="ml-0.5 rounded-full bg-white/30 px-1.5 text-[10px] font-semibold dark:bg-black/20"
          >
            {{ resultCountsByType[type.value] }}
          </span>
        </button>
      </div>

      <!-- Contenu principal -->
      <div class="mx-auto max-w-4xl">
        <!-- Loading State -->
        <div v-if="loading && hasSearched" class="space-y-3">
          <div v-for="i in 5" :key="i" class="flex gap-3 rounded-xl bg-white p-3 dark:bg-gray-800">
            <USkeleton class="h-20 w-20 shrink-0 rounded-lg" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-3/4" />
              <USkeleton class="h-3 w-full" />
              <USkeleton class="h-3 w-2/3" />
              <div class="flex items-center justify-between pt-1">
                <USkeleton class="h-2.5 w-20" />
                <USkeleton class="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <!-- Résultats -->
        <div v-else-if="hasSearched">
          <!-- Stats -->
          <div class="mb-4 flex items-center justify-between">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              <span class="font-semibold text-gray-900 dark:text-white">{{ totalResults }}</span>
              résultat{{ totalResults > 1 ? 's' : '' }}
              <span v-if="searchQuery" class="hidden sm:inline">
                pour « <span class="font-medium text-sky-600 dark:text-sky-400">{{ searchQuery }}</span> »
              </span>
            </p>
          </div>

          <!-- Empty State -->
          <div
            v-if="totalResults === 0"
            class="rounded-2xl bg-white p-8 text-center ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
          >
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <UIcon name="i-heroicons-magnifying-glass" class="h-8 w-8 text-gray-400" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white">Aucun résultat</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Essayez de modifier votre recherche ou vos filtres
            </p>
          </div>

          <!-- Results List -->
          <div v-else class="space-y-2">
            <NuxtLink
              v-for="result in searchResults"
              :key="result.document?.id"
              :to="result.formattedUrl || '/actualites'"
              class="flex gap-3 rounded-xl bg-white p-3 ring-1 ring-gray-100 transition-all active:scale-[0.99] md:hover:ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 dark:md:hover:ring-gray-600"
            >
              <!-- Thumbnail -->
              <CmsImage
                :src="result.document?.cover_image"
                :alt="result.document?.title || 'Image'"
                :quality="50"
                :fallback="'/default-image-2.gif'"
                class="h-20 w-20 shrink-0 rounded-lg object-cover md:h-24 md:w-28"
                loading="lazy"
              />

              <!-- Content -->
              <div class="min-w-0 flex-1">
                <!-- Title -->
                <h3
                  class="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white"
                  v-html="result.highlightedTitle"
                />

                <!-- Excerpt -->
                <p
                  class="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400"
                  v-html="result.highlightedContent"
                />

                <!-- Meta -->
                <div class="mt-2 flex items-center justify-between">
                  <time
                    v-if="result.document?.date_published"
                    class="text-[10px] text-gray-400"
                  >
                    {{ formatUnixDate(result.document.date_published) }}
                  </time>
                  <span
                    v-if="result.document?.type || result.document?.category?.name"
                    :class="getBadgeColor(result.document?.type || result.document?.category?.slug)"
                    class="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  >
                    <UIcon
                      :name="result.document?.type === 'document' ? 'i-heroicons-document-text' : 'i-heroicons-newspaper'"
                      class="h-3 w-3"
                    />
                    {{ result.document?.type || result.document?.category?.name }}
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-6 flex flex-col items-center gap-3">
            <UPagination
              v-model="currentPage"
              :page-count="10"
              :total="totalResults"
              size="sm"
              :ui="{
                wrapper: 'flex items-center gap-1',
                base: 'min-w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium',
                active: 'bg-sky-500 text-white',
                inactive: 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-gray-700',
              }"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Page {{ currentPage }} sur {{ totalPages }}
            </p>
          </div>
        </div>

        <!-- Initial State - Popular Searches -->
        <div v-else class="mt-4">
          <!-- Hero -->
          <div class="mb-8 text-center">
            <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30">
              <UIcon name="i-heroicons-magnifying-glass" class="h-10 w-10 text-sky-500" />
            </div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Explorez nos contenus
            </h2>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Documents officiels, actualités et plus encore
            </p>
          </div>

          <!-- Popular Searches -->
          <div class="rounded-2xl bg-white p-4 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Recherches populaires
            </h3>
            <div class="space-y-1">
              <button
                v-for="suggestion in [
                  'Budget 2024',
                  'Assemblée Nationale',
                  'Élections',
                  'Décrets',
                  'Lois et règlements',
                  'Communiqués de presse',
                  'Ministère de l\'Économie',
                  'Projets de développement',
                ]"
                :key="suggestion"
                class="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors active:bg-gray-100 md:hover:bg-gray-50 dark:active:bg-gray-700 dark:md:hover:bg-gray-700/50"
                @click="searchQuery = suggestion; performSearch();"
              >
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                  <UIcon name="i-heroicons-magnifying-glass" class="h-4 w-4 text-gray-400" />
                </div>
                <span class="flex-1 text-sm text-gray-700 dark:text-gray-300">{{ suggestion }}</span>
                <UIcon name="i-heroicons-arrow-up-left" class="h-4 w-4 text-gray-300 dark:text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <ScrollToTopButton />
  </div>
</template>

<style scoped>
/* Style pour le highlighting */
:deep(mark) {
  background-color: #fef3c7;
  padding: 0 0.125rem;
  border-radius: 0.125rem;
  color: #92400e;
}

.dark :deep(mark) {
  background-color: rgba(251, 191, 36, 0.3);
  color: #fcd34d;
}
</style>
