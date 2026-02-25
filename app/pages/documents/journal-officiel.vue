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
  type: 'official_journal',
  limit: 10,
});

const currentPageUI = computed({
  get: () => currentPage.value,
  set: (value) => setCurrentPage(value),
});

// Années dynamiques depuis le CMS
const { years: availableYears, loading: yearsLoading } = useAvailableYears('official_journal');

const yearOptions = computed(() => {
  const options = [{ label: 'Toutes les années', value: 'all' }];
  for (const y of availableYears.value) {
    options.push({ label: `${y.year} (${y.count})`, value: String(y.year) });
  }
  return options;
});

// Event handlers
const handleSearchInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  setSearchQuery(target.value);
};

const handleYearChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value;
  setSelectedFilter(value === 'all' ? '' : value);
};

// Format de la date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <div class="container mx-auto px-4">
      <AppBreadcrumb
        :items="[
          { label: 'Documents', to: '/documents' },
          { label: 'Journal Officiel' },
        ]"
      />
    </div>

    <!-- Sticky Header -->
    <header
      class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95"
    >
      <div class="container mx-auto px-4 py-3">
        <!-- Title Row -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
              Journal Officiel
            </h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ totalItems }} publication{{ totalItems > 1 ? 's' : '' }}
            </p>
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
            placeholder="Rechercher par numéro, date ou contenu..."
            class="block w-full rounded-xl border-0 bg-gray-100 py-3 pl-11 pr-10 text-sm text-gray-900 ring-1 ring-transparent transition-all placeholder:text-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 sm:py-2.5 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:bg-gray-800/80 dark:focus:ring-gray-500"
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

        <!-- Year Filter -->
        <div class="-mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 py-1 scrollbar-hide">
          <div class="relative shrink-0">
            <select
              :value="selectedYear || 'all'"
              :disabled="yearsLoading"
              class="appearance-none rounded-full border-0 bg-gray-100 py-1.5 pl-3 pr-7 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300"
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
            v-if="searchQuery || (selectedYear && selectedYear !== 'all')"
            type="button"
            class="shrink-0 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 active:scale-95 dark:bg-red-900/30 dark:text-red-400"
            @click="setSearchQuery(''); setSelectedFilter('')"
          >
            <UIcon name="i-heroicons-x-mark" class="mr-1 inline h-3 w-3" />
            Reset
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
          <USkeleton class="h-20 w-14 shrink-0 rounded-lg" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-3/4" />
            <USkeleton class="h-3 w-full" />
            <USkeleton class="h-3 w-1/3" />
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
          Impossible de charger les journaux officiels
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
          <UIcon name="i-heroicons-newspaper" class="h-8 w-8 text-gray-400" />
        </div>
        <p class="mt-4 text-sm font-medium text-gray-900 dark:text-white">Aucun résultat</p>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Aucun journal ne correspond à votre recherche
        </p>
        <button
          type="button"
          class="mt-4 rounded-full bg-primary-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-600 active:scale-95"
          @click="setSearchQuery(''); setSelectedFilter('')"
        >
          Réinitialiser les filtres
        </button>
      </div>

      <!-- Results List -->
      <div v-else class="space-y-3">
        <NuxtLink
          v-for="journal in documents"
          :key="journal.id"
          :to="`/documents/${journal.id}/${journal.slug || 'journal-officiel'}`"
          class="group flex gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100 transition-all active:scale-[0.98] sm:hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
        >
          <!-- Thumbnail -->
          <div
            class="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
          >
            <img
              src="/images/default-journal-officiel.webp"
              :alt="journal.title"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          <!-- Content -->
          <div class="flex min-w-0 flex-1 flex-col justify-center">
            <h2
              class="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary-500 dark:text-white"
            >
              {{ journal.title }}
            </h2>
            <p
              v-if="journal.description"
              class="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400"
            >
              {{ journal.description }}
            </p>
            <div class="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
              <UIcon name="i-heroicons-calendar" class="h-3.5 w-3.5" />
              <span>{{ formatDate(journal.publish_date) }}</span>
            </div>
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
