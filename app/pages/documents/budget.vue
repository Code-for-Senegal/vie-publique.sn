<script setup lang="ts">
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
  type: 'budget',
  limit: 10,
});

const currentPageUI = computed({
  get: () => currentPage.value,
  set: (value) => setCurrentPage(value),
});

// Event handlers
const handleSearchInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  setSearchQuery(target.value);
};

useSeoMeta({
  title: 'Documents Budgétaires du Sénégal',
  description: 'Documents Budgétaires sur le Sénégal',
  ogDescription: 'Documents Budgétaires du Sénégal',
  ogImage: 'https://vie-publique.sn/images/share-linkedin.png',
  ogUrl: 'https://vie-publique.sn/documents/budget',
  twitterCard: 'summary_large_image',
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <div class="container mx-auto px-4">
      <AppBreadcrumb
        :items="[
          { label: 'Documents', to: '/documents' },
          { label: 'Documents budgétaires' },
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
              Documents Budgétaires
            </h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ totalItems }} document{{ totalItems > 1 ? 's' : '' }}
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
            placeholder="Rechercher un document budgétaire..."
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
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-4">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-3">
        <div
          v-for="n in 5"
          :key="n"
          class="flex gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
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
          Impossible de charger les documents budgétaires
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
          <UIcon name="i-heroicons-banknotes" class="h-8 w-8 text-gray-400" />
        </div>
        <p class="mt-4 text-sm font-medium text-gray-900 dark:text-white">Aucun résultat</p>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Aucun document ne correspond à votre recherche
        </p>
        <button
          type="button"
          class="mt-4 rounded-full bg-primary-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-600 active:scale-95"
          @click="setSearchQuery('')"
        >
          Réinitialiser
        </button>
      </div>

      <!-- Results List -->
      <div v-else class="space-y-3">
        <NuxtLink
          v-for="document in documents"
          :key="document.id"
          :to="`/documents/${document.id}/${document.slug}`"
          class="group flex gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100 transition-all active:scale-[0.98] sm:hover:shadow-md dark:bg-gray-900 dark:ring-gray-800"
        >
          <!-- Thumbnail -->
          <div
            class="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
          >
            <CmsImage
              v-if="document.cover_image"
              :src="document.cover_image"
              :alt="document.title"
              :quality="25"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <UIcon name="i-heroicons-banknotes" class="h-6 w-6 text-gray-300 dark:text-gray-600" />
            </div>
          </div>

          <!-- Content -->
          <div class="flex min-w-0 flex-1 flex-col justify-center">
            <h2
              class="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary-500 dark:text-white"
            >
              {{ document.title }}
            </h2>
            <div class="mt-2 flex items-center gap-3 text-xs text-gray-400">
              <span class="flex items-center gap-1">
                <UIcon name="i-heroicons-calendar" class="h-3.5 w-3.5" />
                {{ $dateMonthYearformat(document.publish_date) }}
              </span>
              <span v-if="document.file" class="flex items-center gap-1">
                <UIcon name="i-heroicons-document" class="h-3.5 w-3.5" />
                PDF
              </span>
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
