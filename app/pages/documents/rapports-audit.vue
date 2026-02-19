<script setup lang="ts">
const router = useRouter();

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
  type: "audit_report",
  limit: 10,
});

// Computed pour les liaisons avec le template
const searchQueryUI = computed({
  get: () => searchQuery.value,
  set: (value) => {
    setSearchQuery(value);
  },
});

const selectedOrganismeUI = computed({
  get: () => selectedOrganisme.value,
  set: (value) => setSelectedFilter(value),
});

const currentPageUI = computed({
  get: () => currentPage.value,
  set: (value) => setCurrentPage(value),
});

const organismes = [
  "all",
  "Cour des Comptes",
  "OFNAC",
  "CENTIF",
  "IGE",
  "ARMP",
];

const resultsText = computed(() =>
  useResultsText({
    totalItems,
    currentPage,
    itemsPerPage,
    searchQuery,
    customLabels: {
      singular: "rappor",
      plural: "rapports",
      noResults: "Aucun rapport trouvé",
      noResultsWithSearch: 'Aucun rapport trouvé pour "{search}"',
    },
  }),
);

useHead({
  title: "Rapports public Sénégal OFNAC Cours des compte",
  meta: [
    {
      name: "description",
      content:
        "Rapports publics du Sénégal. CENTIF, OFNAC, ARMP, IGE, Cours des Comptes",
    },
  ],
});
</script>

<template>
  <div class="container mx-auto min-h-screen px-4 py-4 pb-16">
    <AppBreadcrumb :items="[
      { label: 'Documents', to: '/documents' },
      { label: 'Rapports publics' }
    ]" />

    <h1 class="sr-only">
      Rapports d'audits publics Sénégal OFNAC Cour des comptes IGE CENTIF
    </h1>

    <ClientOnly>
      <div class="prose prose-sm sm:prose mx-auto my-2">
        <h1 class="text-center text-xl text-gray-900 sm:text-2xl dark:text-gray-200">
          Rapports publics
        </h1>
      </div>

      <p v-if="!loading" class="mb-4 text-center text-sm text-gray-500">
        {{ resultsText }}
      </p>

      <UInput
        v-model="searchQueryUI"
        size="md"
        placeholder="Rechercher..."
        icon="i-heroicons-magnifying-glass"
        class="input custom-shadow mb-1 w-full"
      />

      <div class="my-3 w-full text-center">
        <UButton
          v-for="organisme in organismes"
          :key="organisme"
          class="custom-shadow mb-1 ml-1"
          :color="selectedOrganismeUI === organisme ? 'primary' : 'white'"
          @click="selectedOrganismeUI = organisme"
        >
          {{ organisme === "all" ? "Tous" : organisme }}
        </UButton>
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
        title="Erreur lors du chargement des rapports"
        color="red"
        icon="i-heroicons-exclamation-triangle"
        description="Impossible de charger les rapports. Veuillez réessayer plus tard."
      >
        <template #description>
          <p class="text-sm text-gray-500">
            {{ error }}
          </p>
        </template>
      </UAlert>

      <div
        v-else-if="
          documents.length === 0 && (searchQuery || selectedOrganisme !== 'all')
        "
        class="mt-4 text-center"
      >
        <UAlert
          title="Aucun résultat"
          description="Aucun rapport ne correspond à votre recherche"
          color="blue"
          icon="i-heroicons-information-circle"
        />
      </div>

      <div v-else class="flex flex-col gap-2">
        <!-- Afficher les cartes de rapport une fois chargées -->
        <UCard
          v-for="rapport in documents"
          :key="rapport.id"
          class="custom-shadow cursor-pointer"
        >
          <NuxtLink
            :to="`/documents/${rapport.id}/${rapport.slug}`"
            class="flex flex-row gap-2 p-4"
          >
            <div class="w-12 flex-shrink-0 md:w-16">
              <img
                v-if="rapport.audit_institution == 'ARMP'"
                src="~/assets/logos/armp.webp"
                loading="lazy"
                fetchpriority="high"
                alt="Logo ARMP"
                class="organisme-logo h-auto w-11 md:w-12 lg:w-14"
                width="60"
                height="40"
              />
              <img
                v-if="rapport.audit_institution == 'OFNAC'"
                src="~/assets/logos/ofnac.webp"
                loading="lazy"
                fetchpriority="high"
                alt="Logo OFNAC"
                class="organisme-logo h-auto w-11 md:w-12 lg:w-14"
                width="60"
                height="40"
              />
              <img
                v-if="rapport.audit_institution == 'IGE'"
                src="~/assets/logos/ige.webp"
                loading="lazy"
                fetchpriority="high"
                alt="Logo IGE"
                class="organisme-logo h-auto w-11 md:w-12 lg:w-14"
                width="60"
                height="40"
              />
              <img
                v-if="rapport.audit_institution == 'Cour des Comptes'"
                src="~/assets/logos/cour_des_comptes.webp"
                loading="lazy"
                fetchpriority="high"
                alt="Logo Cours des Comptes"
                class="organisme-logo h-auto w-11 md:w-12 lg:w-14"
                width="60"
                height="40"
              />
              <img
                v-if="rapport.audit_institution == 'CENTIF'"
                src="~/assets/logos/centif.webp"
                loading="lazy"
                fetchpriority="high"
                alt="Logo CENTIF"
                class="organisme-logo h-auto w-11 md:w-12 lg:w-14"
                width="60"
                height="40"
              />
              <img
                v-if="rapport.audit_institution == 'Autres'"
                src="~/assets/logos/doc.svg"
                loading="lazy"
                fetchpriority="high"
                alt="Logo rapport"
                class="organisme-logo h-auto w-11 md:w-12 lg:w-14"
                width="60"
                height="40"
              />
            </div>

            <div class="flex-grow">
              <p class="text-sm font-normal">{{ rapport.title }}</p>
            </div>
          </NuxtLink>
        </UCard>
      </div>

      <div
        v-if="totalPages > 1"
        class="flex justify-center border-t border-gray-200 px-3 py-3.5 dark:border-gray-700"
      >
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
    </ClientOnly>
  </div>
</template>

<style scoped>
.scrollable-hidden {
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollable-hidden::-webkit-scrollbar {
  display: none;
}
</style>
