<script setup lang="ts">
const route = useRoute();
const year = route.params.year as string;

// Validation : l'année doit être un nombre entre 1960 et l'année courante
const yearNum = parseInt(year);
const currentYear = new Date().getFullYear();
if (isNaN(yearNum) || yearNum < 1960 || yearNum > currentYear) {
  throw createError({ statusCode: 404, message: 'Année non valide' });
}

// --- SEO ---

const siteUrl = useRuntimeConfig().public.siteUrl || 'https://www.vie-publique.sn';
const seoTitle = `Documents publics du Sénégal — ${year}`;
const seoDescription = `Consultez tous les documents officiels du Sénégal publiés en ${year} : lois, décrets, rapports, journal officiel et plus encore.`;

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: `${siteUrl}/images/share-linkedin.png`,
  ogUrl: `${siteUrl}/documents/annee/${year}`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
});

useHead({
  link: [{ rel: 'canonical', href: `${siteUrl}/documents/annee/${year}` }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: seoTitle,
        description: seoDescription,
        url: `${siteUrl}/documents/annee/${year}`,
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
  totalItems,
  totalPages,
  itemsPerPage,
  setSearchQuery,
  setCurrentPage,
} = useDocuments({
  limit: 10,
  // Passé à l'init pour que le premier fetch (SSR) soit déjà filtré par année.
  // Mutation tardive (yearFilter.value = year après coup) = SSR vide → page blanche en accès direct.
  year,
});

const currentPageUI = computed({
  get: () => currentPage.value,
  set: (value) => setCurrentPage(value),
});

// --- Navigation années adjacentes ---

const { years: availableYears, loading: yearsLoading } = useAvailableYears();

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

// Vérifier que l'année demandée existe dans la liste
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
          { label: 'Archives', to: '/documents/annee' },
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
              Documents — {{ year }}
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ totalItems }} document{{ totalItems > 1 ? 's' : '' }} publiés en {{ year }}
            </p>
          </div>
        </div>

        <!-- Search -->
        <DocumentsDocumentSearchInput
          :model-value="searchQuery"
          placeholder="Rechercher dans les documents de cette année..."
          @update:model-value="setSearchQuery($event)"
        />

        <!-- Year Navigation -->
        <div class="mt-3 flex items-center justify-between">
          <NuxtLink
            v-if="prevYear"
            :to="`/documents/annee/${prevYear}`"
            class="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          >
            <UIcon name="i-heroicons-chevron-left" class="h-3 w-3" />
            {{ prevYear }}
          </NuxtLink>
          <span v-else />

          <NuxtLink
            to="/documents/annee"
            class="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          >
            Toutes les années
          </NuxtLink>

          <NuxtLink
            v-if="nextYear"
            :to="`/documents/annee/${nextYear}`"
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
        <UIcon name="i-heroicons-calendar-days" class="mb-4 h-12 w-12 text-gray-300" />
        <p class="text-gray-500 dark:text-gray-400">
          Aucun document trouvé pour l'année {{ year }}
        </p>
        <NuxtLink
          to="/documents/annee"
          class="text-primary-500 hover:text-primary-600 mt-2 text-sm font-medium"
        >
          Voir toutes les années disponibles
        </NuxtLink>
      </div>

      <template v-else>
        <!-- Loading -->
        <DocumentsDocumentListSkeleton v-if="loading" thumbnail-shape="tall" />

        <!-- Error -->
        <DocumentsDocumentErrorState
          v-else-if="error"
          message="Impossible de charger les documents"
        />

        <!-- Empty -->
        <DocumentsDocumentEmptyState
          v-else-if="documents.length === 0"
          icon="i-heroicons-calendar-days"
          message="Aucun document ne correspond à votre recherche"
          @reset="setSearchQuery('')"
        />

        <!-- Results -->
        <div v-else class="space-y-3">
          <DocumentsDocumentListItem
            v-for="doc in documents"
            :key="doc.id"
            :document="doc"
            thumbnail-mode="cms-image"
            fallback-icon="i-heroicons-document-text"
            :show-description="true"
            :show-date="true"
            :show-file-indicator="true"
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
