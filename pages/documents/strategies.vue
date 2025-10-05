<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const store = useDocumentsStore();

useSeoMeta({
  title: "Documents Stratégies Sénégal",
  description: "Documents de Stratégie du Sénégal",
  ogDescription: "Documents de Stratégie du Sénégal",
  ogImage: "https://vie-publique.sn/images/share-linkedin.png",
  ogUrl: "https://vie-publique.sn/documents/strategies",
  twitterCard: "summary_large_image",
});

// Lire les query params au montage seulement
onMounted(() => {
  const query = route.query;

  if (query.page) {
    const page = parseInt(query.page as string);
    if (!isNaN(page)) store.currentPage = page;
  }
  if (query.q) store.searchQuery = query.q as string;
  if (query.sort) store.sortBy = query.sort as string;
});

// Utiliser le composable avec le type "strategy"
const { documents, loading, error, pagination } = useDocuments({
  type: "strategy",
  page: computed(() => store.currentPage),
  limit: computed(() => store.itemsPerPage),
  search: computed(() => store.searchQuery),
  sortBy: computed(() => store.sortBy),
});

// Watcher pour mettre à jour le store avec les données de pagination
watchEffect(() => {
  if (pagination.value) {
    store.setTotalItems(pagination.value.total);
  }
});

// Mettre à jour l'URL quand les filtres changent
const updateURL = useDebounceFn(() => {
  const query: any = {};

  if (store.currentPage > 1) query.page = store.currentPage.toString();
  if (store.searchQuery) query.q = store.searchQuery;
  if (store.sortBy !== "-publish_date") query.sort = store.sortBy;

  router.replace({ query });
}, 300);

// Watchers pour la synchronisation URL
watch(
  [() => store.currentPage, () => store.searchQuery, () => store.sortBy],
  updateURL,
  { deep: true },
);

// Computed pour les liaisons avec le template
const searchQuery = computed({
  get: () => store.searchQuery,
  set: (value) => {
    store.setSearchQuery(value);
    store.setCurrentPage(1);
  },
});

const currentPage = computed({
  get: () => store.currentPage,
  set: (value) => {
    store.setCurrentPage(value);
  },
});

const perPageOptions = [
  { label: "10", value: 10 },
  { label: "20", value: 20 },
  { label: "30", value: 30 },
];

// Texte pour l'affichage du nombre de résultats
const resultsText = computed(() => {
  const totalCount = store.totalItems;
  const currentPageStart = (store.currentPage - 1) * store.itemsPerPage + 1;
  const currentPageEnd = Math.min(
    currentPageStart + store.itemsPerPage - 1,
    totalCount,
  );

  const searchText = store.searchQuery ? ` pour "${store.searchQuery}"` : "";

  if (totalCount === 0) {
    return store.searchQuery
      ? `Aucun résultat trouvé pour "${store.searchQuery}"`
      : "Aucun résultat trouvé";
  }

  if (totalCount === 1) {
    return `1 document de stratégie trouvé${searchText}`;
  }

  if (totalCount <= store.itemsPerPage) {
    return `${totalCount} documents de stratégie trouvés${searchText}`;
  }

  return `${currentPageStart}-${currentPageEnd} sur ${totalCount} documents de stratégie${searchText}`;
});

// Fonction pour changer le nombre d'items par page
const updateItemsPerPage = (value: number) => {
  store.itemsPerPage = value;
  store.currentPage = 1;
  window.scrollTo({ top: 0, behavior: "smooth" });
};
</script>

<template>
  <div class="container mx-auto px-4 py-2">
    <!-- Bouton retour -->
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      label="Retour"
      color="gray"
      @click="router.back()"
    />
    <ClientOnly>
      <div class="prose prose-sm sm:prose mx-auto my-4">
        <h1 class="text-center text-xl text-gray-900 sm:text-2xl">
          Documents de stratégie
        </h1>
        <p class="mt-2 text-center text-sm text-gray-600">
          Stratégies nationales, plans de développement, politiques
          sectorielles,...
        </p>
      </div>

      <div class="mb-8 space-y-4">
        <!-- Barre de recherche -->
        <UInput
          v-model="searchQuery"
          size="lg"
          placeholder="Rechercher un document de stratégie..."
          icon="i-heroicons-magnifying-glass"
          class="mx-auto w-full"
        />

        <!-- Résultats de la recherche -->
        <div
          class="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row"
        >
          <span class="text-sm text-gray-600">{{ resultsText }}</span>
        </div>
      </div>

      <template v-if="loading">
        <UCard v-for="n in 3" :key="n" class="mb-4">
          <div class="flex items-start gap-4 p-4">
            <div class="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            <div class="flex-grow">
              <div class="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200" />
              <div class="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </UCard>
      </template>

      <UAlert
        v-else-if="error"
        title="Erreur"
        color="red"
        icon="i-heroicons-exclamation-triangle"
        description="Une erreur s'est produite lors du chargement des documents de stratégie"
      />

      <!-- Résultats vides -->
      <UAlert
        v-else-if="documents.length === 0 && !loading"
        title="Aucun résultat"
        description="Aucun document de stratégie ne correspond à votre recherche."
        color="blue"
        icon="i-heroicons-information-circle"
        class="mb-6"
      />

      <!-- Liste des documents -->
      <div v-else class="space-y-2">
        <UCard
          v-for="document in documents"
          :key="document.id"
          class="transition-shadow duration-200 hover:shadow-md"
        >
          <NuxtLink
            :to="`/documents/${document.id}/${document.slug}`"
            class="flex items-start gap-4 p-4"
          >
            <div class="flex-shrink-0">
              <CmsImage
                v-if="document.cover_image"
                :src="document.cover_image"
                :alt="`Aperçu Doc ${document.title}`"
                :quality="25"
                class="h-full w-16 object-cover"
                loading="lazy"
              />
              <UIcon
                v-else
                name="i-heroicons-document-text"
                class="text-primary-600 h-8 w-8"
              />
            </div>

            <div class="flex-grow">
              <h3 class="mb-1 font-medium text-gray-900">
                {{ document.title }}
              </h3>
              <div class="mt-2 flex flex-wrap gap-4 text-sm text-gray-400">
                <span class="flex items-center gap-1">
                  {{ $dateMonthYearformat(document.publish_date) }}
                </span>
                <span v-if="document.file" class="flex items-center gap-1">
                  <UIcon name="i-heroicons-document" class="h-4 w-4" />
                  PDF
                </span>
              </div>
            </div>
          </NuxtLink>
        </UCard>

        <!-- Pagination -->
        <div
          v-if="store.totalPages > 1"
          class="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">Afficher</span>
            <USelect
              :model-value="store.itemsPerPage"
              :options="perPageOptions"
              size="sm"
              class="w-20"
              @update:model-value="updateItemsPerPage"
            />
            <span class="text-sm text-gray-500">par page</span>
          </div>

          <div class="flex items-center gap-2">
            <UPagination
              v-model="currentPage"
              :total="store.totalItems"
              :page-count="store.itemsPerPage"
              :default-page="1"
              :show-edges="true"
              :sibling-count="2"
              :active-button="{ color: 'yellow' }"
              :ui="{
                wrapper: 'flex items-center gap-1',
                base: 'min-w-8 min-h-8 flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
                active: 'bg-gray-900 text-white',
                inactive: 'bg-white text-gray-900 hover:bg-gray-100',
              }"
            />
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
