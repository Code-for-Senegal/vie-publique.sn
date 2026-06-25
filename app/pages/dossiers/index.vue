<script setup lang="ts">
import { DOSSIER_TYPE_ORDER, dossierTypeLabel } from '~/config/dossiers.config';

const { siteName, siteUrl, defaultImage, themeColor } = useSiteMetadata();

// Garde feature flag : 404 si la feature est désactivée
const { isFeatureEnabled, loading: flagsLoading } = useFeatureFlags();
watchEffect(() => {
  if (!flagsLoading.value && !isFeatureEnabled('menu_dossiers')) {
    throw createError({ statusCode: 404, statusMessage: 'Page non trouvée' });
  }
});

const {
  dossiers,
  loading,
  searchQuery,
  setSearchQuery,
  filterValue,
  setFilterValue,
  currentPage,
  setCurrentPage,
  totalItems,
  totalPages,
  itemsPerPage,
} = useDossiers();

const localSearch = ref(searchQuery.value);
watch(localSearch, (val) => setSearchQuery(val));

// ---- SEO ----
const title = 'Dossiers thématiques | Vie Publique Sénégal';
const description =
  'Les dossiers de Vie-Publique.sn : pages de référence qui centralisent documents, actualités, vidéos, personnalités et institutions autour des grands sujets publics du Sénégal.';
const url = `${siteUrl}/dossiers`;

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: defaultImage,
  ogUrl: url,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterImage: defaultImage,
});

const collectionSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Dossiers thématiques',
  description,
  url,
  isPartOf: { '@type': 'WebSite', name: siteName, url: siteUrl },
  about: { '@type': 'GovernmentOrganization', name: 'République du Sénégal' },
}));

const breadcrumbSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'Dossiers', item: url },
  ],
}));

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'robots', content: 'index, follow, max-image-preview:large' },
  ],
  script: [
    { type: 'application/ld+json', children: JSON.stringify(collectionSchema.value) },
    { type: 'application/ld+json', children: JSON.stringify(breadcrumbSchema.value) },
  ],
});
</script>

<template>
  <div class="min-h-screen bg-white pb-20 dark:bg-transparent">
    <!-- Header -->
    <header
      class="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95 md:relative md:border-0 md:bg-transparent md:backdrop-blur-none"
    >
      <div class="container mx-auto px-4 py-3 md:py-8">
        <h1 class="text-lg font-bold text-gray-900 dark:text-white md:text-3xl">Dossiers</h1>
        <p class="mt-1 hidden max-w-2xl text-sm text-gray-500 dark:text-gray-400 md:block">
          Les pages de référence de Vie-Publique.sn : tout comprendre sur un sujet public,
          documents, actualités et acteurs réunis au même endroit.
        </p>
      </div>
    </header>

    <main class="container mx-auto px-4 py-4 md:py-6">
      <AppBreadcrumb :items="[{ label: 'Dossiers' }]" />

      <!-- Recherche -->
      <div class="mb-4 mt-2">
        <UInput
          v-model="localSearch"
          icon="i-heroicons-magnifying-glass"
          size="lg"
          placeholder="Rechercher un dossier (ex : code du travail, dette publique…)"
          :ui="{ rounded: 'rounded-xl' }"
        />
      </div>

      <!-- Filtres par catégorie -->
      <div class="-mx-4 mb-6 overflow-x-auto px-4">
        <div class="flex gap-2 whitespace-nowrap">
          <button
            type="button"
            class="rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition-colors"
            :class="
              filterValue === 'all'
                ? 'bg-gray-900 text-white ring-gray-900 dark:bg-white dark:text-gray-900 dark:ring-white'
                : 'bg-white text-gray-600 ring-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700'
            "
            @click="setFilterValue('all')"
          >
            Tous
          </button>
          <button
            v-for="t in DOSSIER_TYPE_ORDER"
            :key="t"
            type="button"
            class="rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition-colors"
            :class="
              filterValue === t
                ? 'bg-gray-900 text-white ring-gray-900 dark:bg-white dark:text-gray-900 dark:ring-white'
                : 'bg-white text-gray-600 ring-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700'
            "
            @click="setFilterValue(t)"
          >
            {{ dossierTypeLabel(t) }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <USkeleton v-for="n in 6" :key="n" class="h-64 rounded-2xl" />
      </div>

      <!-- Liste -->
      <template v-else-if="dossiers.length">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DossierCard v-for="dossier in dossiers" :key="dossier.id" :dossier="dossier" />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-8 flex justify-center">
          <UPagination
            :model-value="currentPage"
            :total="totalItems"
            :page-count="itemsPerPage"
            @update:model-value="setCurrentPage"
          />
        </div>
      </template>

      <!-- Empty -->
      <div v-else class="mx-auto max-w-md py-16 text-center">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
        >
          <UIcon name="i-heroicons-folder-open" class="h-8 w-8 text-gray-400" />
        </div>
        <h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Aucun dossier</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{
            searchQuery
              ? 'Aucun dossier ne correspond à votre recherche.'
              : 'Les dossiers seront bientôt disponibles ici.'
          }}
        </p>
      </div>
    </main>

    <ScrollToTopButton />
  </div>
</template>
