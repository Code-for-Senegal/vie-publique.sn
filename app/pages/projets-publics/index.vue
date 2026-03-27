<script setup lang="ts">
// ─── Feature flag guard ──────────────────────────────────────────────
// const { isFeatureEnabled } = useFeatureFlags();
// if (!isFeatureEnabled('menu_projets_publics')) {
//   throw showError({ statusCode: 404, statusMessage: 'Page introuvable' });
// }

// ─── SEO ─────────────────────────────────────────────────────────────
useSeoMeta({
  title: 'Projets Publics du Sénégal - Suivi des investissements',
  description:
    'Tableau de bord des projets publics au Sénégal : PIP, PRES, LFI. Suivi des budgets, répartition par secteur et ministère.',
  ogTitle: 'Projets Publics du Sénégal',
  ogDescription: 'Suivi transparent des projets publics et investissements au Sénégal.',
});

// ─── Data ────────────────────────────────────────────────────────────
const {
  // État filtres
  year,
  version,
  search,
  sectorId,
  policyId,
  ministryId,
  region,
  isPres,
  currentPage,

  // Valeurs disponibles
  availableYears,
  availableVersionsForYear,
  availableSectors,
  availablePolicies,
  availableMinistries,
  availableRegions,

  // Données
  stats,
  projects,
  pagination,
  loading,
  error,

  // Computed
  hasActiveFilters,

  // Méthodes
  setYear,
  setVersion,
  setSearch,
  setSector,
  setPolicy,
  setMinistry,
  setRegion,
  setIsPres,
  setPage,
  resetFilters,
  refresh,
} = usePublicProjects();
</script>

<template>
  <div class="min-h-screen pb-16">
    <!-- Hero Header -->
    <div class="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div class="container mx-auto px-4 py-6 sm:py-8">
        <AppBreadcrumb
          :items="[{ label: 'Accueil', to: '/' }, { label: 'Projets Publics' }]"
          class="mb-4"
        />
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Projets Publics du Sénégal
            </h1>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Suivi des projets publics, investissements PIP et projets PRES
            </p>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ stats.totalProjects }} projets recensés
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="container mx-auto px-4 py-6">
      <!-- Loading initial -->
      <div
        v-if="loading && projects.length === 0"
        class="flex flex-col items-center justify-center py-20"
      >
        <div class="relative h-12 w-12">
          <div class="absolute inset-0 animate-ping rounded-full bg-cyan-200 opacity-75"></div>
          <div class="relative flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100">
            <UIcon
              name="i-heroicons-clipboard-document-list"
              class="h-6 w-6 animate-pulse text-cyan-600"
            />
          </div>
        </div>
        <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">Chargement des projets...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="mx-auto max-w-md py-12">
        <div
          class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20"
        >
          <div
            class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50"
          >
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="h-6 w-6 text-red-600 dark:text-red-400"
            />
          </div>
          <h3 class="text-lg font-semibold text-red-900 dark:text-red-200">Erreur de chargement</h3>
          <p class="mt-2 text-sm text-red-700 dark:text-red-300">
            Impossible de charger les données. Veuillez réessayer.
          </p>
          <button
            class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            @click="refresh()"
          >
            Réessayer
          </button>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="space-y-6">
        <!-- KPI -->
        <PublicProjectsKpiBar :stats="stats" :year="year" />

        <!-- Filtres -->
        <PublicProjectsFilterBar
          :sectors="availableSectors"
          :policies="availablePolicies"
          :ministries="availableMinistries"
          :regions="availableRegions"
          :years="availableYears"
          :versions="availableVersionsForYear"
          :search="search"
          :year="year"
          :version="version"
          :sector-id="sectorId"
          :policy-id="policyId"
          :ministry-id="ministryId"
          :region="region"
          :is-pres="isPres"
          :has-active-filters="hasActiveFilters"
          @update:search="setSearch"
          @update:year="setYear"
          @update:version="setVersion"
          @update:sector-id="setSector"
          @update:policy-id="setPolicy"
          @update:ministry-id="setMinistry"
          @update:region="setRegion"
          @update:is-pres="setIsPres"
          @reset="resetFilters"
        />

        <!-- Graphiques -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PublicProjectsChartBySector :projects="projects" />
          <PublicProjectsChartByMinistry :projects="projects" />
        </div>

        <!-- Tableau -->
        <PublicProjectsTable
          :projects="projects"
          :pagination="pagination"
          :year="year"
          :loading="loading"
          @page-change="setPage"
        />
      </div>
    </div>
  </div>
</template>
