<script setup lang="ts">
import type { PublicProjectMode } from '~~/types/public-project';

interface Props {
  mode: PublicProjectMode;
  title: string;
  description: string;
}

const props = defineProps<Props>();

// ─── Data ────────────────────────────────────────────────────────────
const {
  // Mode
  mode,

  // État filtres
  year,
  version,
  search,
  sectorId,
  policyId,
  ministryId,
  region,
  isPres,

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
  allProjects,
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
} = usePublicProjects({ mode: props.mode });

// ─── Tabs navigation ────────────────────────────────────────────────
const tabs = [
  { id: 'global' as const, label: 'Tous les projets', to: '/projets-publics-senegal' },
  { id: 'pres' as const, label: 'PRES', to: '/projets-publics-senegal/pres' },
  { id: 'pip' as const, label: 'PIP', to: '/projets-publics-senegal/pip' },
];
</script>

<template>
  <div class="min-h-screen pb-16">
    <!-- Hero Header -->
    <div
      class="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-gray-50/50 to-white dark:border-[#38444D] dark:bg-none"
    >
      <!-- Decorative background blur (light only) -->
      <div
        class="bg-primary-100/40 pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-70 blur-3xl dark:hidden"
      ></div>

      <div class="container relative mx-auto px-4 py-4 sm:py-6">
        <AppBreadcrumb
          :items="[
            { label: 'Accueil', to: '/' },
            { label: 'Projets Publics', to: mode === 'global' ? undefined : '/projets-publics-senegal' },
            ...(mode !== 'global' ? [{ label: mode === 'pres' ? 'PRES' : 'PIP' }] : []),
          ]"
          class="mb-6"
        />
        <div class="max-w-2xl">
          <h1
            class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
          >
            {{ title }}
          </h1>
          <p class="mt-2 text-base text-gray-600 dark:text-gray-400">
            {{ description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Tabs navigation mode -->
    <div class="border-b border-gray-200 bg-white dark:border-[#38444D] dark:bg-transparent">
      <div class="container mx-auto px-4">
        <nav class="-mb-px flex gap-1" aria-label="Mode dashboard">
          <NuxtLink
            v-for="tab in tabs"
            :key="tab.id"
            :to="tab.to"
            class="inline-flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors"
            :class="
              tab.id === mode
                ? 'border-cyan-500 text-cyan-600 dark:border-cyan-400 dark:text-cyan-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
            "
          >
            <span
              v-if="tab.id === 'pres'"
              class="h-2 w-2 rounded-full bg-amber-400"
            ></span>
            <span
              v-else-if="tab.id === 'pip'"
              class="h-2 w-2 rounded-full bg-emerald-400"
            ></span>
            {{ tab.label }}
          </NuxtLink>
        </nav>
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
        <PublicProjectsKpiBar :stats="stats" :year="year" :mode="mode" />

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
          :mode="mode"
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

        <!-- Répartition par axe politique -->
        <PublicProjectsCardsByPolicy :projects="allProjects" />

        <!-- Graphiques et carte -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PublicProjectsChartBySector :projects="allProjects" />
          <PublicProjectsChartByMinistry :projects="allProjects" />
          <PublicProjectsMapByRegion :projects="allProjects" class="lg:col-span-2" />
        </div>

        <!-- Tableau -->
        <PublicProjectsTable
          :projects="projects"
          :pagination="pagination"
          :year="year"
          :loading="loading"
          :mode="mode"
          @page-change="setPage"
        />
      </div>
    </div>
  </div>
</template>
