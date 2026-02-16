<script setup lang="ts">
import { DOC_TYPE_LABELS, AUDIT_INSTITUTIONS } from '~~/types/document';

const router = useRouter();

// Vue mode (liste par défaut)
const viewMode = ref<'grid' | 'list'>('list');

const {
  documents,
  loading,
  error,
  refresh,
  currentPage,
  searchQuery,
  totalItems,
  totalPages,
  itemsPerPage,
  filterValue,
  yearFilter,
  auditInstitutionFilter,
  sortBy,
  pagination,
  setSearchQuery,
  setCurrentPage,
  setSortBy,
  setFilterValue,
  setAuditInstitutionFilter,
  hasActiveFilters,
  resetFilters,
} = useDocuments({
  limit: 20,
});

// Types dynamiques depuis le composable
const { types: availableTypes, loading: typesLoading } = useAvailableTypes();

const typeOptions = computed(() => {
  const options = [{ label: 'Tous les types', value: 'all' }];
  for (const t of availableTypes.value) {
    const label = DOC_TYPE_LABELS[t.type] || t.type;
    options.push({ label: `${label} (${t.count})`, value: t.type });
  }
  return options;
});

// Années dynamiques depuis l'API (filtrées par type sélectionné)
const { years: availableYears, loading: yearsLoading } = useAvailableYears(
  computed(() => (filterValue.value && filterValue.value !== 'all' ? filterValue.value : '')),
);

const yearOptions = computed(() => {
  const options = [{ label: 'Toutes les années', value: 'all' }];
  for (const y of availableYears.value) {
    options.push({ label: `${y.year} (${y.count})`, value: String(y.year) });
  }
  return options;
});

// Options de tri
const sortOptions = [
  { label: 'Plus récents', value: '-publish_date' },
  { label: 'Plus anciens', value: 'publish_date' },
  { label: 'A → Z', value: 'title' },
  { label: 'Z → A', value: '-title' },
];

// Label du tri actif
const activeSortLabel = computed(() => {
  const option = sortOptions.find((o) => o.value === sortBy.value);
  return option?.label || 'Plus récents';
});

// Computed pour l'UI (two-way bindings)
const searchQueryUI = computed({
  get: () => searchQuery.value,
  set: (value) => setSearchQuery(value),
});

const selectedTypeUI = computed({
  get: () => filterValue.value || 'all',
  set: (value) => {
    setFilterValue(value === 'all' ? '' : value);
    // Réinitialiser le filtre organisme quand on change de type
    if (value !== 'audit_report') {
      setAuditInstitutionFilter('');
    }
  },
});

const selectedYearUI = computed({
  get: () => yearFilter.value || 'all',
  set: (value) => {
    yearFilter.value = value;
    setCurrentPage(1);
  },
});

const sortByUI = computed({
  get: () => sortBy.value,
  set: (value) => {
    setSortBy(value);
  },
});

// Afficher le filtre organisme uniquement pour audit_report
const showAuditInstitutionFilter = computed(() => selectedTypeUI.value === 'audit_report');

// Texte résultats
const resultsText = computed(() => {
  const total = pagination.value?.total || 0;
  if (total === 0) return '';
  const count = `${total} résultat${total > 1 ? 's' : ''}`;
  return `${count} · ${activeSortLabel.value}`;
});

// Label du type actif pour le SEO
const activeTypeLabel = computed(() => {
  const type = filterValue.value;
  if (!type || type === 'all') return '';
  return DOC_TYPE_LABELS[type] || type;
});

// SEO dynamique
const seoTitle = computed(() => {
  const parts = ['Documents publics du Sénégal'];
  if (activeTypeLabel.value) {
    parts[0] = `${activeTypeLabel.value} - Documents du Sénégal`;
  }
  if (yearFilter.value && yearFilter.value !== 'all') {
    parts.push(yearFilter.value);
  }
  if (searchQuery.value) {
    parts.push(`Recherche: ${searchQuery.value}`);
  }
  return parts.join(' | ');
});

const seoDescription = computed(() => {
  if (activeTypeLabel.value) {
    const year =
      yearFilter.value && yearFilter.value !== 'all' ? ` de ${yearFilter.value}` : '';
    return `Consultez les ${activeTypeLabel.value.toLowerCase()}${year} du Sénégal. Accédez aux documents officiels en toute transparence.`;
  }
  return "Accédez à l'ensemble des documents officiels du Sénégal : Journal officiel, rapports d'audit, codes généraux, lois, décrets et stratégies nationales.";
});

useHead({
  title: seoTitle,
  meta: [
    { name: 'description', content: seoDescription },
  ],
});

useSeoMeta({
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogType: 'website',
});

// Reset tous les filtres y compris year et organisme
const handleReset = () => {
  resetFilters();
  yearFilter.value = 'all';
  setAuditInstitutionFilter('');
};
</script>

<template>
  <div class="container mx-auto px-4 py-4">
    <!-- Bouton retour -->
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      label="Retour"
      color="gray"
      class="mb-2"
      @click="router.back()"
    />

    <!-- En-tête -->
    <div class="mb-4">
      <h1 class="text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
        Documents publics du Sénégal
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Journal officiel, lois, décrets, arrêtés, rapports d'audit, codes généraux
      </p>
    </div>

    <ClientOnly>
      <!-- Recherche et filtres (sticky) -->
      <div
        class="sticky top-0 z-40 -mx-4 space-y-3 bg-white px-4 py-3 shadow-sm dark:bg-gray-900"
      >
        <!-- Barre de recherche -->
        <UInput
          v-model="searchQueryUI"
          size="lg"
          placeholder="Rechercher un document..."
          icon="i-heroicons-magnifying-glass"
          class="w-full"
          :ui="{ icon: { trailing: { pointer: '' } } }"
        >
          <template v-if="searchQueryUI" #trailing>
            <UButton
              color="gray"
              variant="link"
              icon="i-heroicons-x-mark-20-solid"
              :padded="false"
              @click="searchQueryUI = ''"
            />
          </template>
        </UInput>

        <!-- Filtres et toggle vue -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <!-- Filtre type -->
            <USelect
              v-model="selectedTypeUI"
              :options="typeOptions"
              option-attribute="label"
              value-attribute="value"
              size="sm"
              :loading="typesLoading"
              class="w-auto min-w-[140px]"
            />

            <!-- Filtre année -->
            <USelect
              v-model="selectedYearUI"
              :options="yearOptions"
              option-attribute="label"
              value-attribute="value"
              size="sm"
              :loading="yearsLoading"
              class="w-auto min-w-[120px]"
            />

            <!-- Tri -->
            <USelect
              v-model="sortByUI"
              :options="sortOptions"
              option-attribute="label"
              value-attribute="value"
              size="sm"
              class="w-auto min-w-[120px]"
            />
          </div>

          <!-- Toggle vue grille/liste -->
          <div
            class="flex rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-800"
          >
            <button
              type="button"
              :class="[
                'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
                viewMode === 'grid'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              ]"
              @click="viewMode = 'grid'"
            >
              <UIcon name="i-heroicons-squares-2x2" class="h-4 w-4" />
              <span class="hidden sm:inline">Grille</span>
            </button>
            <button
              type="button"
              :class="[
                'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              ]"
              @click="viewMode = 'list'"
            >
              <UIcon name="i-heroicons-list-bullet" class="h-4 w-4" />
              <span class="hidden sm:inline">Liste</span>
            </button>
          </div>
        </div>

        <!-- Filtre par organisme d'audit (uniquement quand type = audit_report) -->
        <div v-if="showAuditInstitutionFilter" class="flex flex-wrap gap-2">
          <button
            :class="[
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:py-2 sm:text-sm',
              !auditInstitutionFilter
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600',
            ]"
            @click="setAuditInstitutionFilter('')"
          >
            Tous
          </button>
          <button
            v-for="institution in AUDIT_INSTITUTIONS"
            :key="institution"
            :class="[
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:py-2 sm:text-sm',
              auditInstitutionFilter === institution
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600',
            ]"
            @click="setAuditInstitutionFilter(institution)"
          >
            {{ institution }}
          </button>
        </div>
      </div>

      <!-- Total, tri actif et réinitialiser -->
      <div
        v-if="loading || hasActiveFilters || totalItems > 0"
        class="mt-4 flex items-center justify-between"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          <span v-if="loading" class="inline-flex items-center gap-1.5">
            <UIcon name="i-heroicons-arrow-path" class="h-3.5 w-3.5 animate-spin" />
            Chargement...
          </span>
          <span v-else-if="totalItems">{{ resultsText }}</span>
          <span v-if="searchQuery"> pour "{{ searchQuery }}"</span>
        </p>

        <UButton
          v-if="hasActiveFilters"
          variant="ghost"
          color="gray"
          size="sm"
          icon="i-heroicons-x-mark"
          label="Réinitialiser"
          @click="handleReset"
        />
      </div>

      <!-- Loading skeleton -->
      <template v-if="loading">
        <!-- Grid skeleton -->
        <div
          v-if="viewMode === 'grid'"
          class="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
        >
          <div
            v-for="n in 8"
            :key="n"
            class="animate-pulse overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700"
          >
            <div class="aspect-[3/2] bg-gray-300 dark:bg-gray-600" />
            <div class="space-y-2 p-2 sm:p-3">
              <div class="h-3 w-3/4 rounded bg-gray-300 sm:h-4 dark:bg-gray-600" />
              <div class="h-3 w-1/2 rounded bg-gray-300 sm:h-4 dark:bg-gray-600" />
              <div class="h-2 w-1/3 rounded bg-gray-300 sm:h-3 dark:bg-gray-600" />
            </div>
          </div>
        </div>
        <!-- List skeleton -->
        <div v-else class="mt-4 space-y-3">
          <div
            v-for="n in 6"
            :key="n"
            class="h-20 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
          />
        </div>
      </template>

      <!-- Error -->
      <div
        v-else-if="error"
        class="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20"
      >
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="mx-auto h-10 w-10 text-red-400 dark:text-red-500"
        />
        <h3 class="mt-3 text-base font-semibold text-red-800 dark:text-red-300">
          Impossible de charger les documents
        </h3>
        <p class="mt-1 text-sm text-red-600 dark:text-red-400">
          Vérifiez votre connexion internet et réessayez. Si le problème persiste,
          rechargez la page.
        </p>
        <div class="mt-4 flex justify-center gap-3">
          <UButton
            color="red"
            variant="soft"
            icon="i-heroicons-arrow-path"
            label="Réessayer"
            @click="refresh()"
          />
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-arrow-top-right-on-square"
            label="Recharger la page"
            @click="reloadNuxtApp()"
          />
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="documents.length === 0 && !loading"
        class="mt-8 rounded-lg border-2 border-dashed border-gray-200 py-12 text-center dark:border-gray-700"
      >
        <UIcon
          name="i-heroicons-document-magnifying-glass"
          class="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600"
        />
        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          Aucun document trouvé
        </h3>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Essayez de modifier vos critères de recherche ou vos filtres.
        </p>
      </div>

      <!-- Documents content -->
      <div v-else class="mt-4">
        <!-- Vue Grille -->
        <div
          v-if="viewMode === 'grid'"
          class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
        >
          <NuxtLink
            v-for="doc in documents"
            :key="doc.id"
            :to="`/documents/${doc.id}/${doc.slug}`"
            class="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <!-- Image de couverture -->
            <div class="aspect-[3/2] overflow-hidden bg-gray-100 dark:bg-gray-700">
              <CmsImage
                v-if="doc.cover_image"
                :src="doc.cover_image"
                :quality="40"
                :alt="`Aperçu ${doc.title}`"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-700"
              >
                <UIcon
                  name="i-heroicons-document-text"
                  class="h-8 w-8 text-gray-300 sm:h-10 sm:w-10 dark:text-gray-500"
                />
              </div>
            </div>

            <!-- Contenu -->
            <div class="p-2 sm:p-3">
              <h3
                class="line-clamp-2 text-xs font-semibold leading-tight text-gray-900 sm:text-sm dark:text-white"
              >
                {{ doc.title }}
              </h3>
              <time
                v-if="doc.publish_date"
                :datetime="doc.publish_date"
                class="mt-1 block text-[10px] text-gray-400 sm:text-xs dark:text-gray-500"
              >
                {{ $dateformat(doc.publish_date) }}
              </time>
            </div>
          </NuxtLink>
        </div>

        <!-- Vue Liste -->
        <div v-else class="space-y-2">
          <NuxtLink
            v-for="doc in documents"
            :key="doc.id"
            :to="`/documents/${doc.id}/${doc.slug}`"
            class="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 transition-shadow hover:shadow-md sm:gap-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <!-- Miniature -->
            <div
              class="h-16 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 shadow-sm sm:h-20 sm:w-28 dark:bg-gray-700"
            >
              <CmsImage
                v-if="doc.cover_image"
                :src="doc.cover_image"
                :quality="30"
                :alt="doc.title"
                class="h-full w-full object-cover"
                loading="lazy"
              />
              <div v-else class="flex h-full w-full items-center justify-center">
                <UIcon
                  name="i-heroicons-document-text"
                  class="h-6 w-6 text-gray-300 dark:text-gray-500"
                />
              </div>
            </div>

            <!-- Contenu -->
            <div class="min-w-0 flex-1">
              <h3 class="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">
                {{ doc.title }}
              </h3>
              <div
                class="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400 dark:text-gray-500"
              >
                <span v-if="doc.publish_date">
                  {{ $dateformat(doc.publish_date) }}
                </span>
              </div>
            </div>

            <!-- Chevron -->
            <UIcon
              name="i-heroicons-chevron-right"
              class="h-5 w-5 flex-shrink-0 text-gray-400"
            />
          </NuxtLink>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <UPagination
            :model-value="currentPage"
            :total="totalItems"
            :page-count="itemsPerPage"
            :show-edges="true"
            :sibling-count="1"
            :active-button="{ color: 'yellow' }"
            :ui="{
              wrapper: 'flex items-center gap-1',
              base: 'min-w-8 min-h-8 flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
              active: 'bg-gray-900 text-white',
              inactive: 'bg-white text-gray-900 hover:bg-gray-100',
            }"
            @update:model-value="setCurrentPage"
          />
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
