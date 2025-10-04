<script setup lang="ts">
import { useSchemaOrg } from "@unhead/schema-org";

const searchQuery = ref("");
const itemsPerPage = ref(10);
const currentPage = ref(1);
const sortBy = ref("-publish_date");
const filterType = ref("");

const router = useRouter();

// Utilisation du composable avec les options de filtrage
const { documents, loading, error, pagination, totalDocuments } = useDocuments({
  page: currentPage,
  limit: itemsPerPage,
  search: searchQuery,
  sortBy,
  filterType,
});

// SEO optimisé pour "documents publics"
useHead({
  title:
    "Documents publics du Sénégal - Journal officiel, Lois, Décrets, Arrêtés | Vie-Publique.sn",
  meta: [
    {
      name: "description",
      content:
        "Consultez tous les documents publics du Sénégal : Journal officiel, lois, décrets, arrêtés, rapports d'audit, codes généraux. Accès direct aux textes officiels de la République du Sénégal.",
    },
    {
      name: "keywords",
      content:
        "documents publics Sénégal, journal officiel, lois Sénégal, décrets, arrêtés, rapports audit, codes généraux, textes officiels, gouvernement Sénégal",
    },
    {
      name: "robots",
      content: "index, follow",
    },
    {
      name: "author",
      content: "Vie-Publique.sn",
    },
    // Open Graph
    {
      property: "og:title",
      content:
        "Documents publics du Sénégal - Journal officiel, Lois, Décrets, Arrêtés",
    },
    {
      property: "og:description",
      content:
        "Consultez tous les documents publics du Sénégal : Journal officiel, lois, décrets, arrêtés, rapports d'audit, codes généraux.",
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:url",
      content: "https://vie-publique.sn/documents/public",
    },
    {
      property: "og:image",
      content: "https://vie-publique.sn/images/vpsn-share-jors.png",
    },
    // Twitter Card
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:title",
      content:
        "Documents publics du Sénégal - Journal officiel, Lois, Décrets, Arrêtés",
    },
    {
      name: "twitter:description",
      content:
        "Consultez tous les documents publics du Sénégal : Journal officiel, lois, décrets, arrêtés, rapports d'audit, codes généraux.",
    },
    {
      name: "twitter:image",
      content: "https://vie-publique.sn/images/vpsn-share-jors.png",
    },
  ],
  link: [
    {
      rel: "canonical",
      href: "https://vie-publique.sn/documents/public",
    },
  ],
});

// Données structurées pour Google
useSchemaOrg([
  {
    "@type": "WebPage",
    name: "Documents publics du Sénégal",
    description:
      "Consultez tous les documents publics du Sénégal : Journal officiel, lois, décrets, arrêtés, rapports d'audit, codes généraux.",
    url: "https://vie-publique.sn/documents/public",
  },
]);

// Options de tri
const sortOptions = [
  { label: "Plus récent", value: "-publish_date" },
  { label: "Plus ancien", value: "publish_date" },
  { label: "Titre (A-Z)", value: "title" },
  { label: "Titre (Z-A)", value: "-title" },
];

const perPageOptions = [
  { label: "10", value: 10 },
  { label: "20", value: 20 },
  { label: "30", value: 30 },
];
// Options de type de document
const typeOptions = [
  { label: "Tous les types", value: "" },
  { label: "Rapport d'audit", value: "audit_report" },
  { label: "Journal officiel", value: "official_journal" },
  { label: "Loi", value: "law" },
  { label: "Codes généraux", value: "code" },
  { label: "Stratégies", value: "strategy" },
];

// Fonction pour gérer le changement de page
const handlePageChange = (page: number) => {
  currentPage.value = page;
  // Faire défiler vers le haut de la liste
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Calcul du nombre total de pages
const totalPages = computed(() => {
  return (
    pagination.value?.totalPages ||
    Math.ceil(totalDocuments.value / itemsPerPage.value)
  );
});

// Fonction pour aller à une page spécifique
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

// Réinitialiser la page lors d'un changement de recherche ou filtre
watch([searchQuery, filterType, sortBy, itemsPerPage], () => {
  currentPage.value = 1;
});

const shouldShowPagination = computed(() => {
  return totalDocuments.value > itemsPerPage.value;
});
</script>

<template>
  <div class="container mx-auto px-4 py-2">
    <!-- Bouton retour -->
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      label="Retour"
      color="gray"
      @click="router.back()"
    />
    <ClientOnly>
      <div class="prose prose-sm sm:prose dark:prose-invert mx-auto my-4">
        <h1
          class="text-center text-xl text-gray-900 sm:text-2xl dark:text-gray-100"
        >
          Documents publics du Sénégal
        </h1>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Journal officiel, lois, décrets, arrêtés, rapports d'audit, codes
          généraux
        </p>
      </div>

      <div class="mb-8 space-y-4">
        <!-- Barre de recherche -->
        <UInput
          v-model="searchQuery"
          size="lg"
          placeholder="Rechercher un document public..."
          icon="i-heroicons-magnifying-glass"
          class="mx-auto w-full"
        />

        <!-- Filtres et tri -->
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400"
              >Filtrer par:</span
            >
            <USelect
              v-model="filterType"
              :options="typeOptions"
              size="md"
              class="w-full sm:w-48"
            />
          </div>

          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400"
              >Trier par:</span
            >
            <USelect
              v-model="sortBy"
              :options="sortOptions"
              size="md"
              class="w-full sm:w-48"
            />
          </div>
        </div>

        <!-- Compteur de résultats -->
        <div
          class="flex flex-col items-center justify-between text-sm text-gray-500 sm:flex-row dark:text-gray-400"
        >
          <span v-if="totalDocuments > 0">
            {{
              totalDocuments > 1
                ? ` ${totalDocuments} documents trouvés`
                : `1 document trouvé`
            }}
            <template v-if="totalDocuments > itemsPerPage">
              - Page {{ currentPage }} sur {{ pagination.totalPages || 1 }}
            </template>
          </span>
          <span v-else>Aucun document trouvé</span>
        </div>
      </div>

      <template v-if="loading">
        <UCard v-for="n in 3" :key="n" class="mb-4">
          <div class="flex items-start gap-4 p-4">
            <div
              class="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
            />
            <div class="flex-grow">
              <div
                class="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              />
              <div
                class="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              />
            </div>
          </div>
        </UCard>
      </template>

      <UAlert
        v-else-if="error"
        title="Erreur"
        color="red"
        icon="i-heroicons-exclamation-triangle"
        description="Une erreur est survenue lors de la récupération des documents"
      >
      </UAlert>

      <div v-else class="space-y-2">
        <UCard
          v-for="doc in documents"
          :key="doc.id"
          class="custom-shadow transition-shadow duration-200 hover:shadow-md dark:bg-gray-800/80"
        >
          <NuxtLink
            :to="`/documents/${doc.id}/${doc.slug}`"
            class="flex items-start gap-4"
          >
            <div class="flex-shrink-0">
              <UIcon
                name="i-heroicons-document-text"
                class="text-primary-600 h-8 w-8 dark:text-gray-400"
              />
            </div>

            <div class="flex-grow">
              <h3 class="mb-1 font-medium text-gray-900 dark:text-gray-100">
                {{ doc.title }}
              </h3>
              <p class="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                {{ (doc as any).description }}
              </p>
              <div
                v-if="doc.publish_date"
                class="mt-1 flex flex-wrap gap-4 text-sm text-gray-400"
              >
                <span
                  class="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                >
                  {{ $dateMonthYearformat(doc.publish_date) }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </UCard>

        <!-- Message si aucun résultat -->
        <div v-if="documents.length === 0" class="py-12 text-center">
          <UIcon
            name="i-heroicons-document-magnifying-glass"
            class="mx-auto mb-4 h-12 w-12 text-gray-400"
          />
          <p class="text-gray-600 dark:text-gray-400">
            Aucun document trouvé pour votre recherche
          </p>
        </div>

        <!-- Pagination -->
        <div
          v-if="shouldShowPagination"
          class="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400"
              >Afficher</span
            >
            <USelect
              v-model="itemsPerPage"
              :options="perPageOptions"
              size="sm"
              class="w-20"
            />
            <span class="text-sm text-gray-500 dark:text-gray-400"
              >par page</span
            >
          </div>

          <!-- <UPagination
            v-model="currentPage"
            :page-count="pagination?.totalPages || 1"
            :total="totalDocuments"
            :active-button="{ color: 'yellow' }"
            :ui="{
              wrapper: 'flex items-center gap-1',
              base: 'min-w-8 min-h-8 flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
              active: 'bg-blue-900 text-white',
              inactive:
                'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700',
            }"
            @update:model-value="handlePageChange"
          /> -->
          <div class="flex items-center gap-2">
            <UButton
              :disabled="currentPage === 1"
              icon="i-heroicons-chevron-left"
              variant="ghost"
              @click="goToPage(currentPage - 1)"
            />

            <span class="text-sm text-gray-600 dark:text-gray-400">
              Page {{ currentPage }} sur {{ totalPages }}
            </span>

            <UButton
              :disabled="currentPage === totalPages"
              icon="i-heroicons-chevron-right"
              variant="ghost"
              @click="goToPage(currentPage + 1)"
            />
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
