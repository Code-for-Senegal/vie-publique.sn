<script setup lang="ts">
import {
  DOSSIER_TYPE_LABELS,
  DOSSIER_TYPE_ORDER,
  dossierTypeLabel,
} from '~/config/dossiers.config';

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

// Types de dossiers RÉELLEMENT présents (publiés) → on n'affiche QUE les filtres
// qui ont du contenu (pas de chip vide menant à « Aucun dossier »).
// ⚠️ Robustesse : le champ `type` de Directus peut stocker soit la clé config
// (`legislative`), soit le label FR (`Législatif`). On garde donc la valeur
// brute renvoyée par l'API (pour que le filtre `_eq` matche), et on ordonne
// selon DOSSIER_TYPE_ORDER en reconnaissant les deux formes.
const { data: typesData } = await useAsyncData('dossiers-types', () =>
  $fetch<{ types: Array<{ type: string; count: number }> }>('/api/dossiers/types'),
);
const typeOrderIndex = (value: string): number => {
  const byKey = DOSSIER_TYPE_ORDER.indexOf(value as (typeof DOSSIER_TYPE_ORDER)[number]);
  if (byKey !== -1) return byKey;
  const byLabel = DOSSIER_TYPE_ORDER.findIndex((k) => DOSSIER_TYPE_LABELS[k] === value);
  return byLabel === -1 ? DOSSIER_TYPE_ORDER.length : byLabel;
};
const filterTypes = computed(() =>
  [...(typesData.value?.types || [])].sort(
    (a, b) => typeOrderIndex(a.type) - typeOrderIndex(b.type),
  ),
);

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

// Pas de BreadcrumbList en page : le @graph global de @nuxtjs/seo l'émet déjà.

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'robots', content: 'index, follow, max-image-preview:large' },
  ],
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(collectionSchema.value) }],
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <!-- Breadcrumb -->
    <div class="container mx-auto px-4 pt-2">
      <AppBreadcrumb :items="[{ label: 'Dossiers' }]" />
    </div>

    <!-- Sticky Header -->
    <header
      class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95"
    >
      <div class="container mx-auto px-4 py-3">
        <!-- Title Row -->
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">Dossiers</h1>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ totalItems }} dossier{{ totalItems > 1 ? 's' : '' }}
          </span>
        </div>
        <p class="mt-0.5 hidden max-w-2xl text-sm text-gray-500 dark:text-gray-400 sm:block">
          Les pages de référence de Vie-Publique.sn : tout comprendre sur un sujet public,
          documents, actualités et acteurs réunis au même endroit.
        </p>

        <!-- Recherche -->
        <div class="group relative mt-3">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <UIcon
              name="i-heroicons-magnifying-glass-20-solid"
              class="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-gray-500"
            />
          </div>
          <input
            v-model="localSearch"
            type="search"
            placeholder="Rechercher un dossier (ex : code du travail, dette publique…)"
            class="block w-full rounded-xl border-0 bg-gray-100 py-3 pl-11 pr-10 text-sm text-gray-900 ring-1 ring-transparent transition-all placeholder:text-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:bg-gray-800/80 dark:focus:ring-gray-500 sm:py-2.5"
          />
          <button
            v-if="localSearch"
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            @click="localSearch = ''"
          >
            <span
              class="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600"
            >
              <UIcon
                name="i-heroicons-x-mark-20-solid"
                class="h-3.5 w-3.5 text-gray-600 dark:text-gray-300"
              />
            </span>
          </button>
        </div>

        <!-- Filtres par catégorie -->
        <nav
          v-if="filterTypes.length"
          class="scrollbar-hide -mx-4 mt-3 overflow-x-auto px-4 pb-1"
          aria-label="Filtrer par catégorie"
        >
          <div class="flex gap-1.5 py-0.5">
            <button
              type="button"
              class="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-all active:scale-95"
              :class="
                filterValue === 'all'
                  ? 'bg-gray-900 text-white ring-gray-900 dark:bg-white dark:text-gray-900 dark:ring-white'
                  : 'bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700'
              "
              :aria-pressed="filterValue === 'all'"
              @click="setFilterValue('all')"
            >
              Tous
            </button>
            <button
              v-for="t in filterTypes"
              :key="t.type"
              type="button"
              class="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-all active:scale-95"
              :class="
                filterValue === t.type
                  ? 'bg-gray-900 text-white ring-gray-900 dark:bg-white dark:text-gray-900 dark:ring-white'
                  : 'bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700'
              "
              :aria-pressed="filterValue === t.type"
              @click="setFilterValue(t.type)"
            >
              {{ dossierTypeLabel(t.type) }}
              <span class="text-[10px] opacity-70">({{ t.count }})</span>
            </button>
          </div>
        </nav>
      </div>
    </header>

    <main class="container mx-auto px-4 py-4 md:py-6">
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

<style scoped>
/* Masquer la scrollbar horizontale des filtres */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
