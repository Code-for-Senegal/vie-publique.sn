<script setup lang="ts">
import armpLogo from '~/assets/logos/armp.webp';
import ofnacLogo from '~/assets/logos/ofnac.webp';
import igeLogo from '~/assets/logos/ige.webp';
import courDesComptesLogo from '~/assets/logos/cour_des_comptes.webp';
import centifLogo from '~/assets/logos/centif.webp';
import docLogo from '~/assets/logos/doc.svg';

// --- Category Configuration (shared with parent) ---

const CATEGORY_SEO: Record<
  string,
  {
    type: string;
    label: string;
    countLabel: string;
    icon: string;
    fallbackIcon: string;
    ogImage: string;
    thumbnailMode: 'cms-image' | 'static-image' | 'logo';
    staticImage?: string;
    showDescription: boolean;
    showDate: boolean;
    showFileIndicator: boolean;
    showAuditInstitution: boolean;
  }
> = {
  'journal-officiel-senegal': {
    type: 'official_journal',
    label: 'Journal Officiel',
    countLabel: 'publication',
    icon: 'i-heroicons-newspaper',
    fallbackIcon: 'i-heroicons-newspaper',
    ogImage: '/images/vpsn-share-jors.png',
    thumbnailMode: 'static-image',
    staticImage: '/images/default-journal-officiel.webp',
    showDescription: true,
    showDate: true,
    showFileIndicator: false,
    showAuditInstitution: false,
  },
  'rapports-audit': {
    type: 'audit_report',
    label: 'Rapports publics',
    countLabel: 'rapport',
    icon: 'i-heroicons-document-chart-bar',
    fallbackIcon: 'i-heroicons-document-chart-bar',
    ogImage: '/images/share-linkedin.png',
    thumbnailMode: 'logo',
    showDescription: false,
    showDate: false,
    showFileIndicator: false,
    showAuditInstitution: true,
  },
  strategies: {
    type: 'strategy',
    label: 'Documents Stratégies',
    countLabel: 'document',
    icon: 'i-heroicons-presentation-chart-line',
    fallbackIcon: 'i-heroicons-presentation-chart-line',
    ogImage: '/images/share-linkedin.png',
    thumbnailMode: 'cms-image',
    showDescription: false,
    showDate: true,
    showFileIndicator: true,
    showAuditInstitution: false,
  },
  codes: {
    type: 'code',
    label: 'Codes du Sénégal',
    countLabel: 'code',
    icon: 'i-heroicons-scale',
    fallbackIcon: 'i-heroicons-scale',
    ogImage: '/images/vpsn-share-jors.png',
    thumbnailMode: 'cms-image',
    showDescription: true,
    showDate: true,
    showFileIndicator: false,
    showAuditInstitution: false,
  },
  budget: {
    type: 'budget',
    label: 'Documents Budgétaires',
    countLabel: 'document',
    icon: 'i-heroicons-banknotes',
    fallbackIcon: 'i-heroicons-banknotes',
    ogImage: '/images/vpsn-share-budget.png',
    thumbnailMode: 'cms-image',
    showDescription: false,
    showDate: true,
    showFileIndicator: true,
    showAuditInstitution: false,
  },
};

// --- Logo mapping (rapports-audit) ---

const logoMap: Record<string, string> = {
  ARMP: armpLogo,
  OFNAC: ofnacLogo,
  IGE: igeLogo,
  'Cour des Comptes': courDesComptesLogo,
  CENTIF: centifLogo,
};
const getLogo = (institution: string) => logoMap[institution] || docLogo;

// --- Route params ---

const route = useRoute();
const category = route.params.category as string;
const year = route.params.year as string;

const config = CATEGORY_SEO[category];
if (!config) {
  throw createError({ statusCode: 404, message: 'Catégorie non trouvée' });
}

// Validation année
const yearNum = parseInt(year);
const currentYear = new Date().getFullYear();
if (isNaN(yearNum) || yearNum < 1960 || yearNum > currentYear) {
  throw createError({ statusCode: 404, message: 'Année non valide' });
}

// --- SEO ---

const siteUrl = useRuntimeConfig().public.siteUrl || 'https://www.vie-publique.sn';
const seoTitle = `${config.label} du Sénégal — ${year}`;
const seoDescription = `Consultez les documents « ${config.label} » du Sénégal publiés en ${year}. Accédez aux textes officiels en ligne.`;

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: `${siteUrl}${config.ogImage}`,
  ogUrl: `${siteUrl}/documents/${category}/annee/${year}`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
});

useHead({
  link: [{ rel: 'canonical', href: `${siteUrl}/documents/${category}/annee/${year}` }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: seoTitle,
        description: seoDescription,
        url: `${siteUrl}/documents/${category}/annee/${year}`,
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
  totalItems,
  totalPages,
  itemsPerPage,
  searchQuery,
  setSearchQuery,
  setCurrentPage,
} = useDocuments({
  type: config.type,
  limit: 10,
  // Passé à l'init pour que le premier fetch (SSR) soit déjà filtré par année.
  // Mutation tardive (yearFilter.value = year après coup) = SSR désynchronisé → page blanche en accès direct.
  year,
});

const currentPageUI = computed({
  get: () => currentPage.value,
  set: (value) => setCurrentPage(value),
});

// --- Navigation années adjacentes ---

const { years: availableYears, loading: yearsLoading } = useAvailableYears(config.type);

const prevYear = computed(() => {
  const sorted = availableYears.value
    .map((y) => y.year)
    .filter((y) => y < yearNum)
    .sort((a, b) => b - a);
  return sorted.length > 0 ? sorted[0] : null;
});

const nextYear = computed(() => {
  const sorted = availableYears.value
    .map((y) => y.year)
    .filter((y) => y > yearNum)
    .sort((a, b) => a - b);
  return sorted.length > 0 ? sorted[0] : null;
});

const yearExists = computed(() => {
  if (yearsLoading.value) return true;
  return availableYears.value.some((y) => y.year === yearNum);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <div class="container mx-auto px-4">
      <AppBreadcrumb
        :items="[
          { label: 'Documents', to: '/documents' },
          { label: config.label, to: `/documents/${category}` },
          { label: `${year}` },
        ]"
      />
    </div>

    <h1 class="sr-only">{{ seoTitle }}</h1>

    <!-- Sticky Header -->
    <header
      class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95"
    >
      <div class="container mx-auto px-4 py-3">
        <!-- Title Row -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
              {{ config.label }} — {{ year }}
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ totalItems }} {{ config.countLabel }}{{ totalItems > 1 ? 's' : '' }} publiés en
              {{ year }}
            </p>
          </div>
        </div>

        <!-- Search -->
        <DocumentsDocumentSearchInput
          :model-value="searchQuery"
          :placeholder="`Rechercher dans les ${config.countLabel}s de ${year}...`"
          @update:model-value="setSearchQuery($event)"
        />

        <!-- Year Navigation -->
        <div class="mt-3 flex items-center justify-between">
          <NuxtLink
            v-if="prevYear"
            :to="`/documents/${category}/annee/${prevYear}`"
            class="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          >
            <UIcon name="i-heroicons-chevron-left" class="h-3 w-3" />
            {{ prevYear }}
          </NuxtLink>
          <span v-else />

          <NuxtLink
            :to="`/documents/${category}`"
            class="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          >
            Tous les {{ config.countLabel }}s
          </NuxtLink>

          <NuxtLink
            v-if="nextYear"
            :to="`/documents/${category}/annee/${nextYear}`"
            class="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          >
            {{ nextYear }}
            <UIcon name="i-heroicons-chevron-right" class="h-3 w-3" />
          </NuxtLink>
          <span v-else />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-4">
      <!-- Année inexistante -->
      <div
        v-if="!yearsLoading && !yearExists"
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon :name="config.icon" class="mb-4 h-12 w-12 text-gray-300" />
        <p class="text-gray-500 dark:text-gray-400">
          Aucun {{ config.countLabel }} trouvé pour l'année {{ year }}
        </p>
        <NuxtLink
          :to="`/documents/${category}`"
          class="text-primary-500 hover:text-primary-600 mt-2 text-sm font-medium"
        >
          Voir tous les {{ config.countLabel }}s
        </NuxtLink>
      </div>

      <template v-else>
        <!-- Loading -->
        <DocumentsDocumentListSkeleton
          v-if="loading"
          :thumbnail-shape="config.thumbnailMode === 'logo' ? 'square' : 'tall'"
        />

        <!-- Error -->
        <DocumentsDocumentErrorState
          v-else-if="error"
          :message="`Impossible de charger les ${config.countLabel}s`"
        />

        <!-- Empty -->
        <DocumentsDocumentEmptyState
          v-else-if="documents.length === 0"
          :icon="config.icon"
          :message="`Aucun ${config.countLabel} ne correspond à votre recherche`"
          @reset="setSearchQuery('')"
        />

        <!-- Results -->
        <div v-else class="space-y-3">
          <DocumentsDocumentListItem
            v-for="doc in documents"
            :key="doc.id"
            :document="doc"
            :thumbnail-mode="config.thumbnailMode"
            :static-image="config.staticImage"
            :get-logo="config.thumbnailMode === 'logo' ? getLogo : undefined"
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
      </template>
    </main>
  </div>
</template>
