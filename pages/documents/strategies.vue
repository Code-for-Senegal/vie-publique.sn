<script setup lang="ts">
const { documents, loading, error } = useDocuments({ type: "strategy" });
const searchQuery = ref("");
const itemsPerPage = ref(10);
const currentPage = ref(1);

const router = useRouter();

useSeoMeta({
  title: "Documents Stratégies Sénégal",
  description: "Documents de Stratégie du Sénégal",
  ogDescription: "Documents de Stratégie du Sénégal",
  ogImage: "https://vie-publique.sn/images/share-linkedin.png",
  ogUrl: "https://vie-publique.sn/documents/strategies",
  twitterCard: "summary_large_image",
});

const filteredDocuments = computed(() => {
  if (!documents.value) return [];
  const searchLower = searchQuery.value.toLowerCase();
  return documents.value.filter(
    (doc) =>
      doc.title?.toLowerCase().includes(searchLower) ||
      doc.description?.toLowerCase().includes(searchLower),
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
  <div class="container mx-auto px-4 py-4">
    <!-- Bouton retour -->
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      label="Retour à la liste"
      color="gray"
      @click.native="router.back()"
    />
    <ClientOnly>
      <div class="prose prose-sm sm:prose mx-auto my-4">
        <h1 class="text-center text-gray-900">Documents de stratégie</h1>
      </div>

      <div class="mb-8">
        <UInput
          v-model="searchQuery"
          size="lg"
          placeholder="Rechercher un document..."
          icon="i-heroicons-magnifying-glass"
          class="mx-auto w-full"
        />

        <div
          class="mt-2 flex flex-col items-center justify-between text-sm text-gray-500 sm:flex-row"
        >
          <span>{{ filteredDocuments.length }} documents trouvés</span>
          <USelect
            v-model="itemsPerPage"
            :options="[10, 20, 50]"
            size="sm"
            class="mt-2 w-32 sm:mt-0"
          />
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

      <div v-else class="space-y-4">
        <UCard
          v-for="doc in paginatedDocuments"
          :key="doc.id"
          class="transition-shadow duration-200 hover:shadow-md"
        >
          <NuxtLink
            :to="`/documents/${doc.id}/${doc.slug}`"
            class="flex items-start gap-4"
          >
            <div class="flex-shrink-0">
              <img
                v-if="doc.cover_image"
                :src="$directusImageUrl(doc.cover_image, '25')"
                :alt="`Aperçu Doc ${doc.title}`"
                class="h-full w-16 object-cover"
                loading="lazy"
                fetchpriority="high"
              />
              <UIcon
                v-else
                name="i-heroicons-document-text"
                class="text-primary-600 h-8 w-8"
              />
            </div>

            <div class="flex-grow">
              <h3 class="mb-1 font-medium text-gray-900">
                {{ doc.title }}
              </h3>
              <p class="line-clamp-2 text-sm text-gray-500">
                {{ doc.description }}
              </p>
              <div class="mt-2 flex flex-wrap gap-4 text-sm text-gray-400">
                <span class="flex items-center gap-1">
                  <!-- <UIcon name="i-heroicons-calendar" class="h-4 w-4" /> -->
                  {{ $dateMonthYearformat(doc.publish_date) }}
                </span>
                <span v-if="doc.file" class="flex hidden items-center gap-1">
                  <UIcon name="i-heroicons-document" class="h-4 w-4" />
                  PDF
                </span>
              </div>
            </div>
          </NuxtLink>
        </UCard>

        <!-- Pagination -->
        <div class="mt-6 flex justify-center">
          <UPagination
            v-model="currentPage"
            :total="filteredDocuments.length"
            :per-page="itemsPerPage"
            :ui="{
              wrapper: 'flex items-center gap-1',
              base: 'min-w-8 min-h-8 flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
              active: 'bg-gray-900 text-white',
              inactive: 'bg-white text-gray-900 hover:bg-gray-100',
            }"
            @change="handlePageChange"
          />
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
