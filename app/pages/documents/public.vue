<script setup lang="ts">
const router = useRouter()

const {
  documents,
  loading,
  error,
  currentPage,
  searchQuery,
  totalItems,
  totalPages,
  itemsPerPage,
  filterType,
  setSearchQuery,
  setCurrentPage,
  setSortBy,
  setSelectedFilter,
  sortBy,
  hasActiveFilters,
  resetFilters,
} = useDocuments({
  limit: 10,
})

// Computed pour l'UI
const searchQueryUI = computed({
  get: () => searchQuery.value,
  set: (value) => setSearchQuery(value),
})

const currentPageUI = computed({
  get: () => currentPage.value,
  set: (value) => setCurrentPage(value),
})

const sortByUI = computed({
  get: () => sortBy.value,
  set: (value) => setSortBy(value),
})

const selectedTypeUI = computed({
  get: () => filterType.value || 'all',
  set: (value) => setSelectedFilter(value === 'all' ? '' : value),
})

const resultsText = computed(() =>
  useResultsText({
    totalItems,
    currentPage,
    itemsPerPage,
    searchQuery,
    filterType: filterType.value,
    customLabels: {
      singular: 'document',
      plural: 'documents',
      noResults: 'Aucun document trouvé',
      noResultsWithSearch: 'Aucun document trouvé pour "{search}"',
    },
  }),
)

const sortOptions = [
  { label: 'Plus récent', value: '-publish_date' },
  { label: 'Plus ancien', value: 'publish_date' },
  { label: 'Titre (A-Z)', value: 'title' },
  { label: 'Titre (Z-A)', value: '-title' },
]

const perPageOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '30', value: 30 },
]

const typeOptions = [
  { label: 'Tous les documents', value: 'all' },
  { label: "Rapport d'audit", value: 'audit_report' },
  { label: 'Journal officiel', value: 'official_journal' },
  { label: 'Loi', value: 'law' },
  { label: 'Codes généraux', value: 'code' },
  { label: 'Stratégies', value: 'strategy' },
]

// Fonction pour changer le nombre d'items par page
const updateItemsPerPage = (value: number) => {
  itemsPerPage.value = value
  currentPage.value = 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
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
      <div class="prose prose-sm mx-auto my-4 sm:prose dark:prose-invert">
        <h1 class="text-center text-xl text-gray-900 sm:text-2xl dark:text-gray-100">
          Documents publics du Sénégal
        </h1>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Journal officiel, lois, décrets, arrêtés, rapports d'audit, codes généraux
        </p>
      </div>

      <div class="mb-8 space-y-4">
        <!-- Barre de recherche -->
        <UInput
          v-model="searchQueryUI"
          size="lg"
          placeholder="Rechercher un document..."
          icon="i-heroicons-magnifying-glass"
          class="mx-auto w-full"
        />

        <!-- Filtres et tri -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <USelect
              v-model="selectedTypeUI"
              :options="typeOptions"
              size="md"
              class="w-full sm:w-48"
            />
          </div>

          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <USelect v-model="sortByUI" :options="sortOptions" size="md" class="w-full sm:w-48" />
          </div>
        </div>

        <div class="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
          <span class="text-sm text-gray-600">{{ resultsText }}</span>

          <UButton
            v-if="hasActiveFilters"
            variant="ghost"
            color="gray"
            label="Réinitialiser les filtres"
            class="text-sm"
            @click="resetFilters()"
          />
        </div>
      </div>

      <template v-if="loading">
        <UCard v-for="n in 3" :key="n" class="mb-4">
          <div class="flex items-start gap-4 p-4">
            <div class="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            <div class="flex-grow">
              <div class="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div class="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
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

        <div
          v-if="totalPages > 1"
          class="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">Afficher</span>
            <USelect
              :model-value="itemsPerPage"
              :options="perPageOptions"
              size="sm"
              class="w-20"
              @update:model-value="updateItemsPerPage"
            />
            <span class="text-sm text-gray-500 dark:text-gray-400">par page</span>
          </div>

          <div class="flex items-center gap-2">
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
    </ClientOnly>
  </div>
</template>
