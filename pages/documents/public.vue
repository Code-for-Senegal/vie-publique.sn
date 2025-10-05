<!-- public.vue -->
<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const store = useDocumentsStore();

// Lire les query params au montage seulement
onMounted(() => {
  const query = route.query;

  if (query.page) {
    const page = parseInt(query.page as string);
    if (!isNaN(page)) store.currentPage = page;
  }
  if (query.q) store.searchQuery = query.q as string;
  if (query.type) store.selectedType = query.type as string;
  if (query.sort) store.sortBy = query.sort as string;
});

// Utiliser le composable
const { documents, loading, error, pagination } = useDocuments({
  page: computed(() => store.currentPage),
  limit: computed(() => store.itemsPerPage),
  search: computed(() => store.searchQuery),
  filterType: computed(() =>
    store.selectedType !== "all" ? store.selectedType : undefined,
  ),
  sortBy: computed(() => store.sortBy),
});

// SEO optimisé pour "documents publics"
useHead({
  title:
    "Documents publics du Sénégal - Journal officiel, Lois, Décrets, Arrêtés | Vie-Publique.sn",
  meta: [
    {
      name: "description",
      content:
        "Consultez tous les documents publics du Sénégal : Journal officiel, lois, décrets, arrêtés, rapports d'audit, codes généraux. Accès direct aux textes officiels de la République du Sénégal.",
    },
    {
      name: "keywords",
      content:
        "documents publics Sénégal, journal officiel, lois Sénégal, décrets, arrêtés, rapports audit, codes généraux, textes officiels, gouvernement Sénégal",
    },
    {
      name: "robots",
      content: "index, follow",
    },
    {
      name: "author",
      content: "Vie-Publique.sn",
    },
    // Open Graph
    {
      property: "og:title",
      content:
        "Documents publics du Sénégal - Journal officiel, Lois, Décrets, Arrêtés",
    },
    {
      property: "og:description",
      content:
        "Consultez tous les documents publics du Sénégal : Journal officiel, lois, décrets, arrêtés, rapports d'audit, codes généraux.",
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:url",
      content: "https://vie-publique.sn/documents/public",
    },
    {
      property: "og:image",
      content: "https://vie-publique.sn/images/vpsn-share-jors.png",
    },
    // Twitter Card
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:title",
      content:
        "Documents publics du Sénégal - Journal officiel, Lois, Décrets, Arrêtés",
    },
    {
      name: "twitter:description",
      content:
        "Consultez tous les documents publics du Sénégal : Journal officiel, lois, décrets, arrêtés, rapports d'audit, codes généraux.",
    },
    {
      name: "twitter:image",
      content: "https://vie-publique.sn/images/vpsn-share-jors.png",
    },
  ],
  link: [
    {
      rel: "canonical",
      href: "https://vie-publique.sn/documents/public",
    },
  ],
});

// Données structurées pour Google
useSchemaOrg([
  {
    "@type": "WebPage",
    name: "Documents publics du Sénégal",
    description:
      "Consultez tous les documents publics du Sénégal : Journal officiel, lois, décrets, arrêtés, rapports d'audit, codes généraux.",
    url: "https://vie-publique.sn/documents/public",
  },
]);

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
  if (store.selectedType !== "all") query.type = store.selectedType;
  if (store.sortBy !== "-publish_date") query.sort = store.sortBy;

  router.replace({ query });
}, 300);

// Watchers pour la synchronisation URL
watch(
  [
    () => store.currentPage,
    () => store.searchQuery,
    () => store.selectedType,
    () => store.sortBy,
  ],
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

const selectedType = computed({
  get: () => store.selectedType,
  set: (value) => {
    store.setSelectedType(value);
    store.setCurrentPage(1);
  },
});

const currentPage = computed({
  get: () => store.currentPage,
  set: (value) => {
    store.setCurrentPage(value);
  },
});

const sortBy = computed({
  get: () => store.sortBy,
  set: (value) => {
    store.setSortBy(value);
  },
});

// Options de tri
const sortOptions = [
  { label: "Plus récent", value: "-publish_date" },
  { label: "Plus ancien", value: "publish_date" },
  { label: "Titre (A-Z)", value: "title" },
  { label: "Titre (Z-A)", value: "-title" },
];

const perPageOptions = [
  { label: "10", value: 10 },
  { label: "20", value: 20 },
  { label: "30", value: 30 },
];

// Options de type de document
const typeOptions = [
  { label: "Tous les documents", value: "all" },
  { label: "Rapport d'audit", value: "audit_report" },
  { label: "Journal officiel", value: "official_journal" },
  { label: "Loi", value: "law" },
  { label: "Codes généraux", value: "code" },
  { label: "Stratégies", value: "strategy" },
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
  const typeText =
    store.selectedType !== "all"
      ? ` de type "${typeOptions.find((t) => t.value === store.selectedType)?.label}"`
      : "";

  if (totalCount === 0) {
    return store.searchQuery
      ? `Aucun résultat trouvé pour "${store.searchQuery}"`
      : "Aucun résultat trouvé";
  }

  if (totalCount === 1) {
    return `1 document trouvé${searchText}${typeText}`;
  }

  if (totalCount <= store.itemsPerPage) {
    return `${totalCount} documents trouvés${searchText}${typeText}`;
  }

  return `${currentPageStart}-${currentPageEnd} sur ${totalCount} documents${searchText}${typeText}`;
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
      <div class="prose prose-sm sm:prose dark:prose-invert mx-auto my-4">
        <h1
          class="text-center text-xl text-gray-900 sm:text-2xl dark:text-gray-100"
        >
          Documents publics du Sénégal
        </h1>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Journal officiel, lois, décrets, arrêtés, rapports d'audit, codes
          généraux
        </p>
      </div>

      <div class="mb-8 space-y-4">
        <!-- Barre de recherche -->
        <UInput
          v-model="searchQuery"
          size="lg"
          placeholder="Rechercher un document..."
          icon="i-heroicons-magnifying-glass"
          class="mx-auto w-full"
        />

        <!-- Filtres et tri -->
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400"
              >Filtrer par:</span
            >
            <USelect
              v-model="selectedType"
              :options="typeOptions"
              size="md"
              class="w-full sm:w-48"
            />
          </div>

          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400"
              >Trier par:</span
            >
            <USelect
              v-model="sortBy"
              :options="sortOptions"
              size="md"
              class="w-full sm:w-48"
            />
          </div>
        </div>

        <!-- Résultats et bouton réinitialiser -->
        <div
          class="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row"
        >
          <span class="text-sm text-gray-600">{{ resultsText }}</span>

          <!-- Bouton réinitialiser -->
          <UButton
            v-if="store.hasActiveFilters"
            variant="ghost"
            color="gray"
            label="Réinitialiser les filtres"
            class="text-sm"
            @click="store.resetFilters()"
          />
        </div>
      </div>

      <template v-if="loading">
        <UCard v-for="n in 3" :key="n" class="mb-4">
          <div class="flex items-start gap-4 p-4">
            <div
              class="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
            />
            <div class="flex-grow">
              <div
                class="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              />
              <div
                class="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              />
            </div>
          </div>
        </UCard>
      </template>

      <UAlert
        v-else-if="error"
        title="Erreur"
        color="red"
        icon="i-heroicons-exclamation-triangle"
        description="Une erreur s'est produite lors du chargement des documents"
      />

      <!-- Résultats vides -->
      <UAlert
        v-else-if="documents.length === 0 && !loading"
        title="Aucun résultat"
        description="Aucun document ne correspond à votre recherche."
        color="blue"
        icon="i-heroicons-information-circle"
        class="mb-6"
      />

      <!-- Liste des documents -->
      <div v-else class="space-y-2">
        <UCard
          v-for="document in documents"
          :key="document.id"
          class="custom-shadow transition-shadow duration-200 hover:shadow-md dark:bg-gray-800/80"
        >
          <NuxtLink
            :to="`/documents/${document.id}/${document.slug}`"
            class="flex items-start gap-4 p-4"
          >
            <div class="flex-shrink-0">
              <UIcon
                name="i-heroicons-document-text"
                class="text-primary-600 h-8 w-8 dark:text-gray-400"
              />
            </div>
            <div class="flex-grow">
              <h3 class="mb-1 font-medium text-gray-900 dark:text-gray-100">
                {{ document.title }}
              </h3>
              <p class="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                {{ (document as any).description }}
              </p>
              <div
                v-if="document.publish_date"
                class="mt-1 flex flex-wrap gap-4 text-sm text-gray-400"
              >
                <span
                  class="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                >
                  {{ $dateMonthYearformat(document.publish_date) }}
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
            <span class="text-sm text-gray-500 dark:text-gray-400"
              >Afficher</span
            >
            <USelect
              :model-value="store.itemsPerPage"
              :options="perPageOptions"
              size="sm"
              class="w-20"
              @update:model-value="updateItemsPerPage"
            />
            <span class="text-sm text-gray-500 dark:text-gray-400"
              >par page</span
            >
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
