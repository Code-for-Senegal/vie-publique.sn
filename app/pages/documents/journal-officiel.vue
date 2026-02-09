<script setup lang="ts">
const {
  documents,
  loading,
  error,
  currentPage,
  searchQuery,
  filterType: selectedYear,
  totalItems,
  totalPages,
  itemsPerPage,
  setSearchQuery,
  setSelectedFilter,
  setCurrentPage,
} = useDocuments({
  type: "official_journal",
  limit: 10,
});

const selectedYearUI = computed({
  get: () => selectedYear.value,
  set: (value) => setSelectedFilter(value),
});

// Computed pour l'UI
const searchQueryUI = computed({
  get: () => searchQuery.value,
  set: (value) => setSearchQuery(value),
});

const currentPageUI = computed({
  get: () => currentPage.value,
  set: (value) => setCurrentPage(value),
});

const resultsText = computed(() =>
  useResultsText({
    totalItems,
    currentPage,
    itemsPerPage,
    searchQuery,
    filterType: selectedYear.value,
    documentType: "official_journal",
    customLabels: {
      singular: "journal",
      plural: "journaux",
      noResults: "Aucun journal trouvé",
      noResultsWithSearch: 'Aucun journal trouvé pour "{search}"',
    },
  }),
);

// Années dynamiques depuis le CMS
const { years: availableYears, loading: yearsLoading } = useAvailableYears('official_journal');

const yearOptions = computed(() => {
  const options = [{ label: 'Toutes les années', value: 'all' }];
  for (const y of availableYears.value) {
    options.push({ label: `${y.year} (${y.count})`, value: String(y.year) });
  }
  return options;
});

// Format de la date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
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
        class="from-primary-600 to-primary-500 bg-clip-text text-center text-xl font-bold sm:text-3xl dark:text-gray-200"
      >
        Journal Officiel du Sénégal
      </h1>
    </div>

    <!-- Recherche et filtres -->
    <div class="mb-8">
      <div class="flex flex-col gap-3 sm:flex-row">
        <UInput
          v-model="searchQueryUI"
          size="lg"
          placeholder="Rechercher par numéro, date ou contenu..."
          icon="i-heroicons-magnifying-glass"
          class="custom-shadow flex-1"
        />

        <USelect
          v-model="selectedYearUI"
          :options="yearOptions"
          option-attribute="label"
          value-attribute="value"
          placeholder="Année"
          size="lg"
          :loading="yearsLoading"
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
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <UPagination
          v-model="currentPageUI"
          :total="totalItems"
          :page-count="itemsPerPage"
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
