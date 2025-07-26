<script setup lang="ts">
import { useSchemaOrg } from "@unhead/schema-org";

const { documents, loading, error } = useDocuments({ type: undefined }); // Pas de filtre
const searchQuery = ref("");
const itemsPerPage = ref(10);
const currentPage = ref(1);

const router = useRouter();

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

const filteredDocuments = computed(() => {
  if (!documents.value) return [];
  const searchLower = searchQuery.value.toLowerCase();
  return documents.value.filter(
    (doc) =>
      doc.title?.toLowerCase().includes(searchLower) ||
      (doc as any).description?.toLowerCase().includes(searchLower) ||
      (doc as any).type?.toLowerCase().includes(searchLower),
  );
});

const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredDocuments.value.slice(start, end);
});

// Fonction pour gérer le changement de page
const handlePageChange = (page: number) => {
  currentPage.value = page;
  // Faire défiler vers le haut de la liste
  window.scrollTo({ top: 0, behavior: "smooth" });
};
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
      <div class="prose prose-sm sm:prose mx-auto my-4">
        <h1 class="text-center text-xl text-gray-900 sm:text-2xl">
          Documents publics du Sénégal
        </h1>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Journal officiel, lois, décrets, arrêtés, rapports d'audit, codes
          généraux
        </p>
      </div>

      <div class="mb-8">
        <UInput
          v-model="searchQuery"
          size="lg"
          placeholder="Rechercher un document public..."
          icon="i-heroicons-magnifying-glass"
          class="mx-auto w-full"
        />

        <div
          class="mt-2 flex flex-col items-center justify-between text-sm text-gray-500 sm:flex-row"
        >
          <span>{{ filteredDocuments.length }} documents publics trouvés</span>
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
      >
        {{ error }}
      </UAlert>

      <div v-else class="space-y-2">
        <UCard
          v-for="doc in paginatedDocuments"
          :key="doc.id"
          class="custom-shadow transition-shadow duration-200 hover:shadow-md"
        >
          <NuxtLink
            :to="`/documents/${doc.id}/${doc.slug}`"
            class="flex items-start gap-4"
          >
            <div class="flex-shrink-0">
              <UIcon
                name="i-heroicons-document-text"
                class="text-primary-600 h-8 w-8"
              />
            </div>

            <div class="flex-grow">
              <h3 class="mb-1 font-medium text-gray-900">
                {{ doc.title }}
              </h3>
              <p class="line-clamp-2 text-sm text-gray-500">
                {{ (doc as any).description }}
              </p>
              <div
                class="mt-1 flex flex-wrap gap-4 text-sm text-gray-400"
                v-if="doc.publish_date"
              >
                <span
                  class="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-400"
                >
                  {{ $dateMonthYearformat(doc.publish_date) }}
                </span>
              </div>
              <div class="mt-1 hidden">
                <span class="flex items-center gap-1">
                  {{ $dateMonthYearformat(doc.publish_date) }}
                </span>
                <span
                  class="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                >
                  {{ (doc as any).type }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </UCard>

        <!-- Pagination -->
        <div
          class="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">Afficher</span>
            <USelect
              v-model="itemsPerPage"
              :options="[10, 20, 50]"
              size="sm"
              class="w-20"
            />
            <span class="text-sm text-gray-500">par page</span>
          </div>

          <UPagination
            v-model="currentPage"
            :total="filteredDocuments.length"
            :per-page="itemsPerPage"
            :active-button="{ color: 'yellow' }"
            :ui="{
              wrapper: 'flex items-center gap-1',
              base: 'min-w-8 min-h-8 flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
              active: 'bg-blue-900 text-white',
              inactive: 'bg-white text-gray-900 hover:bg-gray-100',
            }"
            @change="handlePageChange"
          />
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
