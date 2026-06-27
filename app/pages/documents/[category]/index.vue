<script setup lang="ts">
import armpLogo from '~/assets/logos/armp.webp';
import ofnacLogo from '~/assets/logos/ofnac.webp';
import igeLogo from '~/assets/logos/ige.webp';
import courDesComptesLogo from '~/assets/logos/cour_des_comptes.webp';
import centifLogo from '~/assets/logos/centif.webp';
import docLogo from '~/assets/logos/doc.svg';

// --- Category Configuration ---

interface CategoryConfig {
  type: string;
  family?: string;
  title: string;
  breadcrumbLabel: string;
  countLabel: string;
  searchPlaceholder: string;
  emptyIcon: string;
  fallbackIcon: string;
  errorMessage: string;
  emptyMessage: string;
  filters: ('year' | 'audit_institution')[];
  thumbnailMode: 'cms-image' | 'static-image' | 'logo';
  staticImage?: string;
  showDescription: boolean;
  showDate: boolean;
  showFileIndicator: boolean;
  showAuditInstitution: boolean;
  seo: {
    title: string;
    description: string;
    ogImage: string;
  };
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  'journal-officiel-senegal': {
    type: 'official_journal',
    title: 'Journal Officiel',
    breadcrumbLabel: 'Journal Officiel',
    countLabel: 'publication',
    searchPlaceholder: 'Rechercher par numéro, date ou contenu...',
    emptyIcon: 'i-heroicons-newspaper',
    fallbackIcon: 'i-heroicons-newspaper',
    errorMessage: 'Impossible de charger les journaux officiels',
    emptyMessage: 'Aucun journal ne correspond à votre recherche',
    filters: ['year'],
    thumbnailMode: 'static-image',
    staticImage: '/images/default-journal-officiel.webp',
    showDescription: true,
    showDate: true,
    showFileIndicator: false,
    showAuditInstitution: false,
    seo: {
      title: 'Journal Officiel du Sénégal',
      description:
        'Consultez les publications du Journal Officiel de la République du Sénégal : lois, décrets, arrêtés et textes officiels.',
      ogImage: '/images/vpsn-share-jors.png',
    },
  },
  'rapports-audit': {
    type: 'audit_report',
    title: 'Rapports publics',
    breadcrumbLabel: 'Rapports publics',
    countLabel: 'rapport',
    searchPlaceholder: 'Rechercher un rapport...',
    emptyIcon: 'i-heroicons-document-chart-bar',
    fallbackIcon: 'i-heroicons-document-chart-bar',
    errorMessage: 'Impossible de charger les rapports',
    emptyMessage: 'Aucun rapport ne correspond à votre recherche',
    filters: ['audit_institution'],
    thumbnailMode: 'logo',
    showDescription: false,
    showDate: false,
    showFileIndicator: false,
    showAuditInstitution: true,
    seo: {
      title: 'Rapports publics Sénégal - OFNAC, Cour des Comptes',
      description: 'Rapports publics du Sénégal: CENTIF, OFNAC, ARMP, IGE, Cour des Comptes',
      ogImage: '/images/share-linkedin.png',
    },
  },
  strategies: {
    type: 'strategy',
    title: 'Documents Stratégies',
    breadcrumbLabel: 'Documents de stratégie',
    countLabel: 'document',
    searchPlaceholder: 'Rechercher un document de stratégie...',
    emptyIcon: 'i-heroicons-presentation-chart-line',
    fallbackIcon: 'i-heroicons-presentation-chart-line',
    errorMessage: 'Impossible de charger les documents de stratégie',
    emptyMessage: 'Aucun document ne correspond à votre recherche',
    filters: [],
    thumbnailMode: 'cms-image',
    showDescription: false,
    showDate: true,
    showFileIndicator: true,
    showAuditInstitution: false,
    seo: {
      title: 'Documents Stratégies Sénégal',
      description: 'Documents de Stratégie du Sénégal',
      ogImage: '/images/share-linkedin.png',
    },
  },
  codes: {
    type: 'code',
    title: 'Codes du Sénégal',
    breadcrumbLabel: 'Codes généraux',
    countLabel: 'code',
    searchPlaceholder: 'Rechercher un code...',
    emptyIcon: 'i-heroicons-scale',
    fallbackIcon: 'i-heroicons-scale',
    errorMessage: 'Impossible de charger les codes',
    emptyMessage: 'Aucun code ne correspond à votre recherche',
    filters: [],
    thumbnailMode: 'cms-image',
    showDescription: true,
    showDate: true,
    showFileIndicator: false,
    showAuditInstitution: false,
    seo: {
      title: 'Codes du Sénégal',
      description:
        'Sénégal Constitution, Code de la famille, Code du travail, Code des collectivités locales, Code de la presse',
      ogImage: '/images/vpsn-share-jors.png',
    },
  },
  budget: {
    type: 'budget',
    title: 'Documents Budgétaires',
    breadcrumbLabel: 'Documents budgétaires',
    countLabel: 'document',
    searchPlaceholder: 'Rechercher un document budgétaire...',
    emptyIcon: 'i-heroicons-banknotes',
    fallbackIcon: 'i-heroicons-banknotes',
    errorMessage: 'Impossible de charger les documents budgétaires',
    emptyMessage: 'Aucun document ne correspond à votre recherche',
    filters: [],
    thumbnailMode: 'cms-image',
    showDescription: false,
    showDate: true,
    showFileIndicator: true,
    showAuditInstitution: false,
    seo: {
      title: 'Documents Budgétaires du Sénégal',
      description: 'Documents Budgétaires sur le Sénégal',
      ogImage: '/images/vpsn-share-budget.png',
    },
  },
  statistiques: {
    type: '',
    family: 'statistics',
    title: 'Documents Statistiques',
    breadcrumbLabel: 'Statistiques',
    countLabel: 'document',
    searchPlaceholder: 'Rechercher un document statistique...',
    emptyIcon: 'i-heroicons-chart-pie',
    fallbackIcon: 'i-heroicons-chart-pie',
    errorMessage: 'Impossible de charger les documents statistiques',
    emptyMessage: 'Aucun document ne correspond à votre recherche',
    filters: [],
    thumbnailMode: 'cms-image',
    showDescription: false,
    showDate: true,
    showFileIndicator: true,
    showAuditInstitution: false,
    seo: {
      title: 'Documents Statistiques du Sénégal',
      description: 'Enquêtes et données statistiques officielles du Sénégal.',
      ogImage: '/images/share-linkedin.png',
    },
  },
  parlementaire: {
    type: '',
    family: 'parliament',
    title: 'Documents Parlementaires',
    breadcrumbLabel: 'Parlementaire',
    countLabel: 'document',
    searchPlaceholder: 'Rechercher un document parlementaire...',
    emptyIcon: 'i-heroicons-building-library',
    fallbackIcon: 'i-heroicons-building-library',
    errorMessage: 'Impossible de charger les documents parlementaires',
    emptyMessage: 'Aucun document ne correspond à votre recherche',
    filters: [],
    thumbnailMode: 'cms-image',
    showDescription: false,
    showDate: true,
    showFileIndicator: true,
    showAuditInstitution: false,
    seo: {
      title: 'Documents Parlementaires du Sénégal',
      description: 'Rapports et questions parlementaires du Sénégal.',
      ogImage: '/images/share-linkedin.png',
    },
  },
  elections: {
    type: '',
    family: 'election',
    title: 'Documents Électoraux',
    breadcrumbLabel: 'Élections',
    countLabel: 'document',
    searchPlaceholder: 'Rechercher un document électoral...',
    emptyIcon: 'i-heroicons-check-badge',
    fallbackIcon: 'i-heroicons-check-badge',
    errorMessage: 'Impossible de charger les documents électoraux',
    emptyMessage: 'Aucun document ne correspond à votre recherche',
    filters: [],
    thumbnailMode: 'cms-image',
    showDescription: false,
    showDate: true,
    showFileIndicator: true,
    showAuditInstitution: false,
    seo: {
      title: 'Documents Électoraux du Sénégal',
      description: 'Documents électoraux officiels du Sénégal.',
      ogImage: '/images/share-linkedin.png',
    },
  },
};

// --- Route & Config ---

const route = useRoute();
const category = route.params.category as string;

const config = CATEGORY_CONFIG[category];
if (!config) {
  throw createError({ statusCode: 404, message: 'Catégorie non trouvée' });
}

// --- SEO ---

const siteUrl = useRuntimeConfig().public.siteUrl || 'https://www.vie-publique.sn';

useSeoMeta({
  title: config.seo.title,
  description: config.seo.description,
  ogTitle: config.seo.title,
  ogDescription: config.seo.description,
  ogImage: `${siteUrl}${config.seo.ogImage}`,
  ogUrl: `${siteUrl}/documents/${category}`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: config.seo.title,
  twitterDescription: config.seo.description,
});

useHead({
  link: [{ rel: 'canonical', href: `${siteUrl}/documents/${category}` }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: config.seo.title,
        description: config.seo.description,
        url: `${siteUrl}/documents/${category}`,
      }),
    },
  ],
});

// --- Documents ---

const {
  documents,
  loading,
  error,
  currentPage,
  searchQuery,
  filterValue: selectedFilter,
  yearFilter,
  totalItems,
  totalPages,
  itemsPerPage,
  setSearchQuery,
  setFilterValue: setSelectedFilter,
  setCurrentPage,
} = useDocuments({
  type: config.type || undefined,
  limit: 10,
  // Passé à l'init pour que le premier fetch (SSR) soit déjà filtré par famille.
  // Mutation tardive (familyFilter.value = ... après coup) = SSR vide en accès direct.
  family: config.family || undefined,
});

const currentPageUI = computed({
  get: () => currentPage.value,
  set: (value) => setCurrentPage(value),
});

// --- Year Filter (journal-officiel) ---

const showYearFilter = config.filters.includes('year');
const { years: availableYears, loading: yearsLoading } = showYearFilter
  ? useAvailableYears(config.type)
  : { years: computed(() => []), loading: ref(false) };

const yearOptions = computed(() => {
  const options = [{ label: 'Toutes les années', value: 'all' }];
  for (const y of availableYears.value) {
    options.push({ label: `${y.year} (${y.count})`, value: String(y.year) });
  }
  return options;
});

const handleYearChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value;
  yearFilter.value = value;
  setCurrentPage(1);
};

// --- Audit Institution Filter (rapports-audit) ---

const showAuditFilter = config.filters.includes('audit_institution');
const organismes = ['all', 'Cour des Comptes', 'OFNAC', 'CENTIF', 'IGE', 'ARMP'];

const logoMap: Record<string, string> = {
  ARMP: armpLogo,
  OFNAC: ofnacLogo,
  IGE: igeLogo,
  'Cour des Comptes': courDesComptesLogo,
  CENTIF: centifLogo,
};
const getLogo = (institution: string) => logoMap[institution] || docLogo;

// --- Reset ---

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value ||
    (selectedFilter.value && selectedFilter.value !== 'all' && selectedFilter.value !== '') ||
    (yearFilter.value && yearFilter.value !== 'all')
  );
});

const resetFilters = () => {
  setSearchQuery('');
  setSelectedFilter('');
  yearFilter.value = 'all';
};
</script>

<template>
  <div v-if="config" class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <div class="container mx-auto px-4">
      <AppBreadcrumb
        :items="[{ label: 'Documents', to: '/documents' }, { label: config.breadcrumbLabel }]"
      />
    </div>

    <h1 class="sr-only">{{ config.seo.title }}</h1>

    <!-- Sticky Header -->
    <header
      class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95"
    >
      <div class="container mx-auto px-4 py-3">
        <!-- Title Row -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
              {{ config.title }}
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ totalItems }} {{ config.countLabel }}{{ totalItems > 1 ? 's' : '' }}
            </p>
          </div>
        </div>

        <!-- Search Input -->
        <DocumentsDocumentSearchInput
          :model-value="searchQuery"
          :placeholder="config.searchPlaceholder"
          @update:model-value="setSearchQuery($event)"
        />

        <!-- Year Filter (journal-officiel) -->
        <div
          v-if="showYearFilter"
          class="scrollbar-hide -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 py-1"
        >
          <div class="relative shrink-0">
            <select
              :value="yearFilter || 'all'"
              :disabled="yearsLoading"
              class="appearance-none rounded-full border-0 bg-gray-100 py-1.5 pl-3 pr-7 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:focus:ring-gray-500"
              @change="handleYearChange"
            >
              <option v-for="opt in yearOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <UIcon
              name="i-heroicons-chevron-down"
              class="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400"
            />
          </div>

          <!-- Reset -->
          <button
            v-if="hasActiveFilters"
            type="button"
            class="shrink-0 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 active:scale-95 dark:bg-red-900/30 dark:text-red-400"
            @click="resetFilters"
          >
            <UIcon name="i-heroicons-x-mark" class="mr-1 inline h-3 w-3" />
            Réinitialiser
          </button>
        </div>

        <!-- Audit Institution Filter (rapports-audit) -->
        <div
          v-if="showAuditFilter"
          class="scrollbar-hide -mx-4 mt-3 flex items-center gap-1.5 overflow-x-auto px-4 py-1"
        >
          <button
            v-for="org in organismes"
            :key="org"
            type="button"
            :class="[
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95',
              selectedFilter === org
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400',
            ]"
            @click="setSelectedFilter(org)"
          >
            {{ org === 'all' ? 'Tous' : org }}
          </button>

          <!-- Effacer -->
          <button
            v-if="hasActiveFilters"
            type="button"
            class="shrink-0 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 active:scale-95 dark:bg-red-900/30 dark:text-red-400"
            @click="resetFilters"
          >
            <UIcon name="i-heroicons-x-mark" class="mr-1 inline h-3 w-3" />
            Effacer
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-4">
      <!-- Loading -->
      <DocumentsDocumentListSkeleton
        v-if="loading"
        :thumbnail-shape="config.thumbnailMode === 'logo' ? 'square' : 'tall'"
      />

      <!-- Error -->
      <DocumentsDocumentErrorState v-else-if="error" :message="config.errorMessage" />

      <!-- Empty -->
      <DocumentsDocumentEmptyState
        v-else-if="documents.length === 0"
        :icon="config.emptyIcon"
        :message="config.emptyMessage"
        @reset="resetFilters"
      />

      <!-- Results List -->
      <div v-else class="space-y-3">
        <DocumentsDocumentListItem
          v-for="doc in documents"
          :key="doc.id"
          :document="doc"
          :thumbnail-mode="config.thumbnailMode"
          :static-image="config.staticImage"
          :get-logo="showAuditFilter ? getLogo : undefined"
          :fallback-icon="config.fallbackIcon"
          :show-description="config.showDescription"
          :show-date="config.showDate"
          :show-file-indicator="config.showFileIndicator"
          :show-audit-institution="config.showAuditInstitution"
        />
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-6 flex justify-center">
        <UPagination
          v-model="currentPageUI"
          :total="totalItems"
          :page-count="itemsPerPage"
          size="sm"
          :ui="{
            wrapper: 'flex items-center gap-1',
            base: 'min-w-[32px] h-8 flex items-center justify-center rounded-full text-sm',
            rounded: 'rounded-full',
          }"
        />
      </div>
    </main>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
