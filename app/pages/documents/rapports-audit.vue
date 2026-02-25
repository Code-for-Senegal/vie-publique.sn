<script setup lang="ts">
import armpLogo from '~/assets/logos/armp.webp';
import ofnacLogo from '~/assets/logos/ofnac.webp';
import igeLogo from '~/assets/logos/ige.webp';
import courDesComptesLogo from '~/assets/logos/cour_des_comptes.webp';
import centifLogo from '~/assets/logos/centif.webp';
import docLogo from '~/assets/logos/doc.svg';

const {
  documents,
  loading,
  error,
  currentPage,
  searchQuery,
  filterType: selectedOrganisme,
  totalItems,
  totalPages,
  itemsPerPage,
  setSearchQuery,
  setSelectedFilter,
  setCurrentPage,
} = useDocuments({
  type: 'audit_report',
  limit: 10,
});

const currentPageUI = computed({
  get: () => currentPage.value,
  set: (value) => setCurrentPage(value),
});

const organismes = ['all', 'Cour des Comptes', 'OFNAC', 'CENTIF', 'IGE', 'ARMP'];

// Event handlers
const handleSearchInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  setSearchQuery(target.value);
};

// Logo mapping avec imports
const logoMap: Record<string, string> = {
  ARMP: armpLogo,
  OFNAC: ofnacLogo,
  IGE: igeLogo,
  'Cour des Comptes': courDesComptesLogo,
  CENTIF: centifLogo,
};

const getLogo = (institution: string) => logoMap[institution] || docLogo;

// Check if filters are active (not default state)
const hasActiveFilters = computed(() => {
  return searchQuery.value || (selectedOrganisme.value && selectedOrganisme.value !== 'all');
});

useHead({
  title: 'Rapports publics Sénégal - OFNAC, Cour des Comptes',
  meta: [
    {
      name: 'description',
      content: 'Rapports publics du Sénégal: CENTIF, OFNAC, ARMP, IGE, Cour des Comptes',
    },
  ],
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <div class="container mx-auto px-4">
      <AppBreadcrumb
        :items="[
          { label: 'Documents', to: '/documents' },
          { label: 'Rapports publics' },
        ]"
      />
    </div>

    <h1 class="sr-only">Rapports d'audits publics Sénégal OFNAC Cour des comptes IGE CENTIF</h1>

    <!-- Sticky Header -->
    <header
      class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95"
    >
      <div class="container mx-auto px-4 py-3">
        <!-- Title Row -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
              Rapports publics
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ totalItems }} rapport{{ totalItems > 1 ? 's' : '' }}
            </p>
          </div>
        </div>

        <!-- Search Input -->
        <div class="group relative mt-3">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <UIcon
              name="i-heroicons-magnifying-glass-20-solid"
              class="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-primary-500"
            />
          </div>
          <input
            type="search"
            :value="searchQuery"
            placeholder="Rechercher un rapport..."
            class="block w-full rounded-xl border-0 bg-gray-100 py-3 pl-11 pr-10 text-sm text-gray-900 ring-1 ring-transparent transition-all placeholder:text-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 sm:py-2.5 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:bg-gray-800/80"
            @input="handleSearchInput"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            @click="setSearchQuery('')"
          >
            <span
              class="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600"
            >
              <UIcon
                name="i-heroicons-x-mark-20-solid"
                class="h-3.5 w-3.5 text-gray-600 dark:text-gray-300"
              />
            </span>
          </button>
        </div>

        <!-- Organisme Filter Chips -->
        <div class="-mx-4 mt-3 flex items-center gap-1.5 overflow-x-auto px-4 py-1 scrollbar-hide">
          <button
            v-for="org in organismes"
            :key="org"
            type="button"
            :class="[
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95',
              selectedOrganisme === org
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
            @click="setSearchQuery(''); setSelectedFilter('all')"
          >
            <UIcon name="i-heroicons-x-mark" class="mr-1 inline h-3 w-3" />
            Effacer
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-4">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-3">
        <div
          v-for="n in 5"
          :key="n"
          class="flex gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
        >
          <USkeleton class="h-12 w-12 shrink-0 rounded-lg" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-3/4" />
            <USkeleton class="h-3 w-1/2" />
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <div
          class="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
        >
          <UIcon name="i-heroicons-exclamation-triangle" class="h-8 w-8 text-red-500" />
        </div>
        <p class="mt-4 text-sm font-medium text-gray-900 dark:text-white">Erreur de chargement</p>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Impossible de charger les rapports
        </p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="documents.length === 0"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <div
          class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
        >
          <UIcon name="i-heroicons-document-chart-bar" class="h-8 w-8 text-gray-400" />
        </div>
        <p class="mt-4 text-sm font-medium text-gray-900 dark:text-white">Aucun résultat</p>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Aucun rapport ne correspond à votre recherche
        </p>
        <button
          type="button"
          class="mt-4 rounded-full bg-primary-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-600 active:scale-95"
          @click="setSearchQuery(''); setSelectedFilter('all')"
        >
          Réinitialiser
        </button>
      </div>

      <!-- Results List -->
      <div v-else class="space-y-3">
        <NuxtLink
          v-for="rapport in documents"
          :key="rapport.id"
          :to="`/documents/${rapport.id}/${rapport.slug}`"
          class="group flex gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100 transition-all active:scale-[0.98] sm:hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
        >
          <!-- Logo -->
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <img
              :src="getLogo(rapport.audit_institution || '')"
              :alt="rapport.audit_institution || 'Rapport'"
              class="h-10 w-10 object-contain"
              loading="lazy"
            />
          </div>

          <!-- Content -->
          <div class="flex min-w-0 flex-1 flex-col justify-center">
            <h3
              class="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary-500 dark:text-white"
            >
              {{ rapport.title }}
            </h3>
            <span
              v-if="rapport.audit_institution"
              class="mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              {{ rapport.audit_institution }}
            </span>
          </div>

          <!-- Arrow -->
          <UIcon
            name="i-heroicons-chevron-right"
            class="h-5 w-5 shrink-0 self-center text-gray-300 dark:text-gray-600"
          />
        </NuxtLink>
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
