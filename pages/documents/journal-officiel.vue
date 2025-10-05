<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { useJournalOfficielStore } from "~/stores/journalOfficiel";

const route = useRoute();
const router = useRouter();
const store = useJournalOfficielStore();

// Lire les query params au montage seulement
onMounted(() => {
  const query = route.query;

  if (query.page) {
    const page = parseInt(query.page as string);
    if (!isNaN(page)) store.currentPage = page;
  }
  if (query.q) store.searchQuery = query.q as string;
  if (query.year) store.selectedYear = query.year as string;
});

const { documents, loading, error, pagination, refresh } = useDocuments({
  type: "official_journal",
  page: computed(() => store.currentPage),
  limit: computed(() => store.itemsPerPage),
  search: computed(() => store.searchQuery),
  filterType: computed(() =>
    store.selectedYear !== "all" ? store.selectedYear : undefined,
  ),
});

// Mettre à jour l'URL quand les filtres changent
const updateURL = useDebounceFn(() => {
  const query: any = {};

  if (store.currentPage > 1) query.page = store.currentPage.toString();
  if (store.searchQuery) query.q = store.searchQuery;
  if (store.selectedYear !== "all") query.year = store.selectedYear;

  router.replace({ query });
}, 300);

// Watchers pour la synchronisation URL
watch(
  [() => store.currentPage, () => store.searchQuery, () => store.selectedYear],
  updateURL,
  { deep: true },
);

// Watcher pour mettre à jour le store avec les données de pagination
watchEffect(() => {
  if (pagination.value) {
    store.setTotalItems(pagination.value.total);
  }
});

// Utiliser les valeurs du store
const searchQuery = computed({
  get: () => store.searchQuery,
  set: (value) => {
    store.setSearchQuery(value);
    store.setCurrentPage(1);
  },
});

const selectedYear = computed({
  get: () => store.selectedYear,
  set: (value) => {
    store.setSelectedYear(value);
    store.setCurrentPage(1);
  },
});

const currentPage = computed({
  get: () => store.currentPage,
  set: (value) => {
    store.setCurrentPage(value);
  },
});

// Options pour le sélecteur d'années
const yearOptions = [
  { label: "Toutes les années", value: "all" },
  { label: "2025", value: "2025" },
  { label: "2024", value: "2024" },
  { label: "2023", value: "2023" },
  { label: "2022", value: "2022" },
  { label: "2021", value: "2021" },
  { label: "2020", value: "2020" },
  { label: "2019", value: "2019" },
  { label: "2018", value: "2018" },
  { label: "2017", value: "2017" },
  { label: "2016", value: "2016" },
];

// Format de la date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Texte pour l'affichage du nombre de résultats
const resultsText = computed(() => {
  const totalCount = store.totalItems;
  const currentPageStart = (store.currentPage - 1) * store.itemsPerPage + 1;
  const currentPageEnd = Math.min(
    currentPageStart + store.itemsPerPage - 1,
    totalCount,
  );

  // Construction des suffixes conditionnels
  const yearText =
    selectedYear.value !== "all" ? ` en ${selectedYear.value}` : "";
  const searchText = store.searchQuery ? ` pour "${store.searchQuery}"` : "";

  if (totalCount === 0) {
    return store.searchQuery
      ? `Aucun résultat trouvé pour "${store.searchQuery}"`
      : "Aucun résultat";
  }

  if (totalCount === 1) {
    return `1 Journal trouvé${searchText}${yearText}`;
  }

  if (totalCount <= store.itemsPerPage) {
    return `${totalCount} Journaux trouvés${searchText}${yearText}`;
  }

  return `${currentPageStart}-${currentPageEnd} sur ${totalCount} journaux${searchText}${yearText}`;
});
</script>

<template>
  <div class="container mx-auto px-4">
    <!-- Bouton retour -->
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      label="Retour"
      color="gray"
      to="/documents"
    />
    <!-- En-tête -->
    <div class="prose prose-sm sm:prose mx-auto my-4">
      <h1
        class="from-primary-600 to-primary-500 bg-clip-text text-center text-xl font-bold sm:text-3xl"
      >
        Journal Officiel du Sénégal
      </h1>
    </div>

    <!-- Recherche et filtres -->
    <div class="mb-8">
      <div class="flex flex-col gap-3 sm:flex-row">
        <UInput
          v-model="searchQuery"
          size="lg"
          placeholder="Rechercher par numéro, date ou contenu..."
          icon="i-heroicons-magnifying-glass"
          class="custom-shadow flex-1"
        />

        <USelect
          v-model="selectedYear"
          :options="yearOptions"
          placeholder="Année"
          size="lg"
          class="custom-shadow w-full sm:w-48"
        />
      </div>

      <div
        class="mt-2 flex flex-col items-center justify-between text-sm text-gray-500 sm:flex-row"
      >
        <span>{{ resultsText }}</span>
      </div>
    </div>

    <!-- Loading state -->
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

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      title="Erreur"
      description="Une erreur s'est produite lors du chargement des journaux."
      color="red"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Résultats vides -->
    <UAlert
      v-else-if="documents.length === 0 && !loading"
      title="Aucun résultat"
      description="Aucun journal officiel ne correspond à votre recherche."
      color="blue"
      icon="i-heroicons-information-circle"
    />

    <!-- Liste des journaux -->
    <div v-else class="space-y-4">
      <UCard
        v-for="journal in documents"
        :key="journal.id"
        :ui="{ body: { padding: 'sm:p-4' } }"
        class="rounded-none transition-shadow duration-200 hover:shadow-lg"
      >
        <NuxtLink
          :to="`/documents/${journal.id}/${journal.slug || 'journal-officiel'}`"
          class="block"
        >
          <div class="flex gap-4">
            <div
              class="flex h-24 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100"
            >
              <img
                src="/images/default-journal-officiel.webp"
                :alt="`${journal.title}`"
                class="h-auto w-full object-contain"
                loading="lazy"
                fetchpriority="high"
              />
            </div>

            <div class="flex-1">
              <div class="flex items-start justify-between gap-4">
                <h2
                  class="hover:text-primary-500 text-sm font-semibold text-blue-800 transition-colors"
                >
                  {{ journal.title }}
                </h2>
              </div>

              <p class="mt-2 line-clamp-2 text-sm text-gray-500">
                {{ journal.description }}
              </p>

              <div class="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <UIcon name="i-heroicons-calendar" />
                <span>{{ formatDate(journal.publish_date) }}</span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </UCard>

      <!-- Pagination -->
      <div v-if="store.totalPages > 1" class="mt-8 flex justify-center">
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
</template>
