<script setup lang="ts">
import { DOC_TYPE_LABELS, DOC_FAMILY_LABELS, AUDIT_INSTITUTIONS } from '~~/types/document';

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
  familyFilter,
  setFamilyFilter,
  hasActiveFilters,
  resetFilters,
} = useDocuments({
  limit: 20,
});

// Types dynamiques depuis le composable (filtrés par famille sélectionnée)
const { types: availableTypes, loading: typesLoading } = useAvailableTypes(familyFilter);

// Familles dynamiques depuis le composable
const { families: availableFamilies, loading: familiesLoading } = useAvailableDocumentFamilies();

const typeOptions = computed(() => {
  const options = [{ label: 'Tous les types', value: 'all' }];
  for (const t of availableTypes.value) {
    const label = DOC_TYPE_LABELS[t.type] || t.type;
    options.push({ label: `${label} (${t.count})`, value: t.type });
  }
  return options;
});

const familyOptions = computed(() => {
  const options = [{ label: 'Toutes les catégories', value: 'all' }];
  for (const f of availableFamilies.value) {
    const label = DOC_FAMILY_LABELS[f.family] || f.family;
    options.push({ label: `${label} (${f.count})`, value: f.family });
  }
  return options;
});

// Années dynamiques depuis l'API (filtrées par type et famille sélectionnés)
const { years: availableYears, loading: yearsLoading } = useAvailableYears(
  computed(() => (filterValue.value && filterValue.value !== 'all' ? filterValue.value : '')),
  familyFilter,
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

// Afficher le filtre organisme uniquement pour audit_report
const showAuditInstitutionFilter = computed(() => filterValue.value === 'audit_report');

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
    const year = yearFilter.value && yearFilter.value !== 'all' ? ` de ${yearFilter.value}` : '';
    return `Consultez les ${activeTypeLabel.value.toLowerCase()}${year} du Sénégal. Accédez aux documents officiels en toute transparence.`;
  }
  return "Accédez à l'ensemble des documents officiels du Sénégal : Journal officiel, rapports d'audit, codes généraux, lois, décrets et stratégies nationales.";
});

useHead({
  title: seoTitle,
  meta: [{ name: 'description', content: seoDescription }],
});

useSeoMeta({
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogType: 'website',
});

// Event handlers for native elements
const handleSearchInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  setSearchQuery(target.value);
};

const handleFamilyChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value;
  setFamilyFilter(value === 'all' ? '' : value);
  setFilterValue('all');
  yearFilter.value = 'all';
};

const handleTypeChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value;
  setFilterValue(value === 'all' ? '' : value);
  if (value !== 'audit_report') {
    setAuditInstitutionFilter('');
  }
};

const handleYearChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value;
  yearFilter.value = value;
  setCurrentPage(1);
};

const handleSortChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value;
  setSortBy(value);
};

// Reset tous les filtres y compris year et organisme
const handleReset = () => {
  resetFilters();
  yearFilter.value = 'all';
  setAuditInstitutionFilter('');
  setFamilyFilter('all');
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <!-- Breadcrumb -->
    <div class="container mx-auto px-4">
      <AppBreadcrumb
        :items="[{ label: 'Documents', to: '/documents' }, { label: 'Tous les documents' }]"
      />
    </div>

    <!-- Sticky Header -->
    <header
      class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95"
    >
      <div class="container mx-auto px-4 py-3">
        <!-- Title Row -->
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
            Documents publics
          </h1>
          <div class="flex items-center gap-2">
            <!-- View Toggle -->
            <div class="flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
              <button
                type="button"
                :class="[
                  'rounded-md p-1.5 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400',
                ]"
                aria-label="Vue grille"
                @click="viewMode = 'grid'"
              >
                <UIcon name="i-heroicons-squares-2x2" class="h-4 w-4" />
              </button>
              <button
                type="button"
                :class="[
                  'rounded-md p-1.5 transition-colors',
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400',
                ]"
                aria-label="Vue liste"
                @click="viewMode = 'list'"
              >
                <UIcon name="i-heroicons-list-bullet" class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Search Input -->
        <div class="group relative mt-3">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <UIcon
              name="i-heroicons-magnifying-glass-20-solid"
              class="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-gray-500"
            />
          </div>
          <input
            type="search"
            :value="searchQuery"
            placeholder="Rechercher un document, un rapport..."
            class="block w-full rounded-xl border-0 bg-gray-100 py-3 pl-11 pr-10 text-sm text-gray-900 ring-1 ring-transparent transition-all placeholder:text-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 sm:py-2.5 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:bg-gray-800/80 dark:focus:ring-gray-500"
            @input="handleSearchInput"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            @click="setSearchQuery('')"
          >
            <span class="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
              <UIcon name="i-heroicons-x-mark-20-solid" class="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" />
            </span>
          </button>
        </div>

        <!-- Filters Row - Horizontal Scroll -->
        <div class="-mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 py-1 scrollbar-hide">
          <!-- Family Filter -->
          <div class="relative shrink-0">
            <select
              :value="familyFilter || 'all'"
              class="appearance-none rounded-full border-0 bg-gray-100 py-1.5 pl-3 pr-7 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-300"
              @change="handleFamilyChange"
            >
              <option v-for="opt in familyOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <UIcon name="i-heroicons-chevron-down" class="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
          </div>

          <!-- Type Filter -->
          <div class="relative shrink-0">
            <select
              :value="filterValue || 'all'"
              class="appearance-none rounded-full border-0 bg-gray-100 py-1.5 pl-3 pr-7 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-300"
              @change="handleTypeChange"
            >
              <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <UIcon name="i-heroicons-chevron-down" class="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
          </div>

          <!-- Year Filter -->
          <div class="relative shrink-0">
            <select
              :value="yearFilter || 'all'"
              class="appearance-none rounded-full border-0 bg-gray-100 py-1.5 pl-3 pr-7 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-300"
              @change="handleYearChange"
            >
              <option v-for="opt in yearOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <UIcon name="i-heroicons-chevron-down" class="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
          </div>

          <!-- Sort -->
          <div class="relative shrink-0">
            <select
              :value="sortBy"
              class="appearance-none rounded-full border-0 bg-gray-100 py-1.5 pl-3 pr-7 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-300"
              @change="handleSortChange"
            >
              <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <UIcon name="i-heroicons-chevron-down" class="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
          </div>

        </div>

        <!-- Audit Institution Filter (conditionally shown) -->
        <div v-if="showAuditInstitutionFilter" class="-mx-4 mt-2 overflow-x-auto px-4 py-1 scrollbar-hide">
          <div class="flex gap-1.5">
            <button
              :class="[
                'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all active:scale-95',
                !auditInstitutionFilter
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400',
              ]"
              @click="setAuditInstitutionFilter('')"
            >
              Tous
            </button>
            <button
              v-for="institution in AUDIT_INSTITUTIONS"
              :key="institution"
              :class="[
                'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all active:scale-95',
                auditInstitutionFilter === institution
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400',
              ]"
              @click="setAuditInstitutionFilter(institution)"
            >
              {{ institution }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 pt-4">
      <!-- Loading Skeleton -->
      <template v-if="loading">
        <!-- Grid skeleton -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <div v-for="n in 8" :key="n" class="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
            <USkeleton class="aspect-[4/3] w-full" />
            <div class="space-y-2 p-3">
              <USkeleton class="h-3 w-full" />
              <USkeleton class="h-3 w-2/3" />
              <USkeleton class="h-2.5 w-1/3" />
            </div>
          </div>
        </div>
        <!-- List skeleton -->
        <div v-else class="space-y-2">
          <div v-for="n in 6" :key="n" class="flex gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-gray-800">
            <USkeleton class="h-16 w-20 shrink-0 rounded-lg" />
            <div class="flex flex-1 flex-col justify-between py-0.5">
              <div class="space-y-2">
                <USkeleton class="h-3.5 w-full" />
                <USkeleton class="h-3.5 w-3/4" />
              </div>
              <USkeleton class="h-2.5 w-24" />
            </div>
          </div>
        </div>
      </template>

      <!-- Error State -->
      <div v-else-if="error" class="py-12">
        <div class="mx-auto max-w-sm rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <UIcon name="i-heroicons-exclamation-triangle" class="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <p class="text-sm font-medium text-red-900 dark:text-red-200">Impossible de charger les documents</p>
          <p class="mt-1 text-xs text-red-700 dark:text-red-300">Vérifiez votre connexion</p>
          <div class="mt-4 flex justify-center gap-2">
            <UButton color="red" variant="soft" size="xs" icon="i-heroicons-arrow-path" @click="refresh()">
              Réessayer
            </UButton>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="documents.length === 0" class="py-16 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <UIcon name="i-heroicons-document-magnifying-glass" class="h-8 w-8 text-gray-400" />
        </div>
        <p class="text-sm font-medium text-gray-900 dark:text-white">Aucun document trouvé</p>
        <p class="mt-1 text-xs text-gray-500">Modifiez vos critères de recherche</p>
        <UButton
          v-if="hasActiveFilters"
          color="gray"
          variant="soft"
          size="sm"
          class="mt-4"
          @click="handleReset"
        >
          Réinitialiser les filtres
        </UButton>
      </div>

      <!-- Documents Content -->
      <div v-else>
        <div
          v-if="totalItems || hasActiveFilters || searchQuery"
          class="mb-3 flex items-center justify-between"
        >
          <p class="text-xs text-gray-500 dark:text-gray-400">
            <span v-if="totalItems">{{ `${totalItems} résultat${totalItems > 1 ? 's' : ''}` }}</span>
            <span v-if="totalItems && (searchQuery || (filterValue && filterValue !== 'all'))">
              ·
            </span>
            <span v-if="searchQuery">pour "{{ searchQuery }}"</span>
            <span v-if="searchQuery && filterValue && filterValue !== 'all'"> · </span>
            <span v-if="filterValue && filterValue !== 'all'">{{
              DOC_TYPE_LABELS[filterValue] || filterValue
            }}</span>
          </p>
          <button
            v-if="hasActiveFilters"
            type="button"
            class="text-xs text-gray-500 underline transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            @click="handleReset"
          >
            Réinitialiser
          </button>
        </div>

        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          <NuxtLink
            v-for="doc in documents"
            :key="doc.id"
            :to="`/documents/${doc.id}/${doc.slug}`"
            class="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition-all active:scale-[0.98] sm:hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
          >
            <!-- Cover -->
            <div class="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
              <CmsImage
                v-if="doc.cover_image"
                :src="doc.cover_image"
                :quality="40"
                :alt="doc.title"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <img
                v-else-if="doc.type === 'official_journal'"
                src="/images/default-journal-officiel.webp"
                :alt="doc.title"
                class="h-full w-full object-cover"
                loading="lazy"
              />
              <div v-else class="flex h-full w-full items-center justify-center">
                <UIcon name="i-heroicons-document-text" class="h-10 w-10 text-gray-300 dark:text-gray-600" />
              </div>
            </div>
            <!-- Content -->
            <div class="p-2.5">
              <h3 class="line-clamp-2 text-xs font-semibold leading-snug text-gray-900 group-hover:text-primary-600 sm:text-sm dark:text-white">
                {{ doc.title }}
              </h3>
              <time
                v-if="doc.publish_date"
                :datetime="doc.publish_date"
                class="mt-1.5 block text-[10px] text-gray-400 dark:text-gray-500"
              >
                {{ $dateformat(doc.publish_date) }}
              </time>
            </div>
          </NuxtLink>
        </div>

        <!-- List View -->
        <div v-else class="space-y-2">
          <NuxtLink
            v-for="doc in documents"
            :key="doc.id"
            :to="`/documents/${doc.id}/${doc.slug}`"
            class="group flex gap-3 rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-gray-100 transition-all active:scale-[0.98] sm:hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
          >
            <!-- Thumbnail -->
            <div class="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-20 sm:w-24 dark:bg-gray-800">
              <CmsImage
                v-if="doc.cover_image"
                :src="doc.cover_image"
                :quality="30"
                :alt="doc.title"
                class="h-full w-full object-cover"
                loading="lazy"
              />
              <img
                v-else-if="doc.type === 'official_journal'"
                src="/images/default-journal-officiel.webp"
                :alt="doc.title"
                class="h-full w-full object-cover"
                loading="lazy"
              />
              <div v-else class="flex h-full w-full items-center justify-center">
                <UIcon name="i-heroicons-document-text" class="h-6 w-6 text-gray-300 dark:text-gray-600" />
              </div>
            </div>
            <!-- Content -->
            <div class="flex min-w-0 flex-1 flex-col justify-between py-0.5">
              <h3 class="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 group-hover:text-primary-600 dark:text-white">
                {{ doc.title }}
              </h3>
              <time
                v-if="doc.publish_date"
                :datetime="doc.publish_date"
                class="text-[11px] text-gray-400 dark:text-gray-500"
              >
                {{ $dateformat(doc.publish_date) }}
              </time>
            </div>
            <UIcon name="i-heroicons-chevron-right" class="h-5 w-5 shrink-0 self-center text-gray-300 dark:text-gray-600" />
          </NuxtLink>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-8 flex justify-center">
          <UPagination
            :model-value="currentPage"
            :total="totalItems"
            :page-count="itemsPerPage"
            size="sm"
            :ui="{
              wrapper: 'flex items-center gap-1',
              rounded: 'rounded-lg',
            }"
            @update:model-value="setCurrentPage"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Hide scrollbar */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
