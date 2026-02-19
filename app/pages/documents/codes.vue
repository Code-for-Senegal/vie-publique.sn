<script setup lang="ts">
const router = useRouter();

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
  type: "code",
  limit: 10,
});

// Computed pour l'UI
const searchQueryUI = computed({
  get: () => searchQuery.value,
  set: (value) => setSearchQuery(value),
});

const currentPageUI = computed({
  get: () => currentPage.value,
  set: (value) => setCurrentPage(value),
});

const resultsText = computed(() =>
  useResultsText({
    totalItems,
    currentPage,
    itemsPerPage,
    searchQuery,
    customLabels: {
      singular: "code",
      plural: "codes",
      noResults: "Aucun code trouvé",
      noResultsWithSearch: 'Aucun code trouvé pour "{search}"',
    },
  }),
);

const perPageOptions = [
  { label: "10", value: 10 },
  { label: "20", value: 20 },
  { label: "30", value: 30 },
];

// Fonction pour changer le nombre d'items par page
const updateItemsPerPage = (value: number) => {
  itemsPerPage.value = value;
  currentPage.value = 1;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

useSeoMeta({
  title: "Code général de la république du Sénégal",
  description:
    "Sénégal Constitution, Code de la famille, Code du travail, Code des collectivités locales, Code de la presse",
  ogDescription: "Documents Budgétaires du Sénégal",
  ogImage: "https://vie-publique.sn/images/vpsn-share-jors.png",
  ogUrl: "https://vie-publique.sn/documents/codes",
  twitterCard: "summary_large_image",
  twitterTitle: "Code général de la république du Sénégal",
  twitterDescription:
    "Sénégal Constitution, Code de la famille, Code du travail, Code des collectivités locales, Code de la presse",
});
</script>

<template>
  <div class="container mx-auto min-h-screen px-4 py-2 pb-16">
    <AppBreadcrumb :items="[
      { label: 'Documents', to: '/documents' },
      { label: 'Codes généraux' }
    ]" />
    <ClientOnly>
      <div class="prose prose-sm sm:prose mx-auto my-4">
        <h1 class="text-center text-xl text-gray-900 sm:text-2xl dark:text-gray-200">
          Codes du Sénégal
        </h1>
        <p class="mt-2 text-center text-sm text-gray-600">
          Constitution, Code de la famille, Code du travail, Code des
          collectivités locales, Code de la presse
        </p>
      </div>

      <div class="mb-8 space-y-4">
        <!-- Barre de recherche -->
        <UInput
          v-model="searchQueryUI"
          size="lg"
          placeholder="Rechercher un code..."
          icon="i-heroicons-magnifying-glass"
          class="mx-auto w-full"
        />

        <!-- Résultats de recherche -->
        <div
          class="mt-2 flex flex-col items-center justify-between text-sm text-gray-500 sm:flex-row"
        >
          <span class="text-sm text-gray-600">{{ resultsText }}</span>
        </div>
      </div>

      <template v-if="loading">
        <UCard v-for="n in 3" :key="n" class="mb-4">
          <div class="flex items-start gap-4 p-4">
            <div class="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            <div class="flex-grow">
              <div class="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200" />
              <div class="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </UCard>
      </template>

      <UAlert
        v-else-if="error"
        title="Erreur"
        color="red"
        icon="i-heroicons-exclamation-triangle"
        description="Une erreur s'est produite lors du chargement des codes du Sénégal"
      />

      <!-- Résultats vides -->
      <UAlert
        v-else-if="documents.length === 0 && !loading"
        title="Aucun résultat"
        description="Aucun code ne correspond à votre recherche."
        color="blue"
        icon="i-heroicons-information-circle"
        class="mb-6"
      />

      <!-- Liste des documents -->
      <div v-else class="space-y-2">
        <UCard
          v-for="document in documents"
          :key="document.id"
          class="custom-shadow transition-shadow duration-200 hover:shadow-md"
        >
          <NuxtLink
            :to="`/documents/${document.id}/${document.slug}`"
            class="flex items-start gap-4"
          >
            <div class="flex-shrink-0">
              <CmsImage
                v-if="document.cover_image"
                :src="document.cover_image"
                :alt="`Aperçu ${document.title}`"
                :quality="25"
                class="h-full w-16 object-cover"
                loading="lazy"
              />
              <UIcon
                v-else
                name="i-heroicons-document-text"
                class="text-primary-600 h-8 w-8"
              />
            </div>

            <div class="flex-grow">
              <h3 class="mb-1 font-medium text-gray-900 dark:text-gray-200">
                {{ document.title }}
              </h3>
              <p class="line-clamp-2 text-sm text-gray-500">
                {{ (document as any).description }}
              </p>
              <div
                v-if="document.publish_date"
                class="mt-1 flex flex-wrap gap-4 text-sm text-gray-400"
              >
                <span
                  class="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-400"
                >
                  {{ $dateMonthYearformat(document.publish_date) }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </UCard>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">Afficher</span>
            <USelect
              :model-value="itemsPerPage"
              :options="perPageOptions"
              size="sm"
              class="w-20"
              @update:model-value="updateItemsPerPage"
            />
            <span class="text-sm text-gray-500">par page</span>
          </div>

          <div class="flex items-center gap-2">
            <UPagination
              v-model="currentPageUI"
              :total="totalItems"
              :page-count="itemsPerPage"
              :default-page="1"
              :show-edges="true"
              :sibling-count="2"
              :active-button="{ color: 'yellow' }"
              :ui="{
                wrapper: 'flex items-center gap-1',
                base: 'min-w-8 min-h-8 flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
                active: 'bg-gray-900 text-white',
                inactive: 'bg-white text-gray-900 hover:bg-gray-100',
              }"
            />
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
