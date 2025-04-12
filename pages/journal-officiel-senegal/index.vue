<!-- index.vue -->
<script setup lang="ts">
const { documents, loading, error } = useDocuments({
  type: "official_journal",
});
const searchQuery = ref("");
const currentView = ref<"grid" | "list">("list");
const router = useRouter();

// Configuration SEO
const seoTitle = "Journal officiel Sénégal";
const seoDescription = "Journal officiel de la république du Sénégal";
const seoImgPath = "/images/vpsn-share-jors-4.png";
const seoPageUrl = "https://vie-publique.sn/journal-officiel-senegal/2024";

useHead({
  title: seoTitle,
  meta: [
    { name: "description", content: seoDescription },
    { name: "twitter:title", content: seoTitle },
    { name: "twitter:description", content: seoDescription },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: seoImgPath },
    { property: "og:title", content: seoTitle },
    { property: "og:description", content: seoDescription },
    { property: "og:image", content: seoImgPath },
    { property: "og:url", content: seoPageUrl },
    { property: "og:type", content: "website" },
  ],
});

const filteredJournals = computed(() => {
  if (!documents.value) return [];

  return documents.value.filter((doc) => {
    const searchLower = searchQuery.value.toLowerCase();
    return (
      doc.title?.toLowerCase().includes(searchLower) ||
      doc.jo_number?.toString().toLowerCase().includes(searchLower) ||
      doc.description?.toLowerCase().includes(searchLower)
    );
  });
});

// Format de la date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
</script>

<template>
  <div class="container mx-auto px-4">
    <!-- Bouton retour -->
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      label="Retour"
      color="gray"
      @click="router.back()"
    />
    <!-- En-tête -->
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center text-xl text-gray-900 sm:text-2xl">
        Journal Officiel
      </h1>
    </div>

    <!-- Recherche -->
    <div class="mb-8">
      <UInput
        v-model="searchQuery"
        size="lg"
        placeholder="Rechercher par numéro, date ou contenu..."
        icon="i-heroicons-magnifying-glass"
        class="custom-shadow sm:w-full"
      />
      <div
        class="mt-2 flex flex-col items-center justify-between text-sm text-gray-500 sm:flex-row"
      >
        <span>{{ filteredJournals.length }} Journaux référencés</span>
      </div>
    </div>

    <!-- Loading state -->
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

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      title="Erreur"
      description="Une erreur s'est produite lors du chargement des journaux."
      color="red"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Résultats vides -->
    <UAlert
      v-else-if="filteredJournals.length === 0"
      title="Aucun résultat"
      description="Aucun journal officiel ne correspond à votre recherche."
      color="gray"
      icon="i-heroicons-inbox"
    />

    <!-- Liste des journaux -->
    <div v-else class="space-y-4">
      <UCard
        v-for="journal in filteredJournals"
        :key="journal.id"
        :ui="{ body: { padding: 'sm:p-4' } }"
        class="rounded-none transition-shadow duration-200 hover:shadow-lg"
      >
        <NuxtLink
          :to="`/documents/${journal.id}/${journal.slug || 'journal-officiel'}`"
          class="block"
        >
          <div class="flex gap-4">
            <div
              class="w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
            >
              <img
                src="/images/default-journal-officiel.webp"
                :alt="`Aperçu JO ${journal.jo_number || ''}`"
                class="h-full w-full object-cover"
                loading="lazy"
                fetchpriority="high"
              />
            </div>

            <div>
              <div class="flex items-start justify-between gap-4">
                <h3 class="text-primary font-semibold">
                  {{ journal.title }}
                </h3>
              </div>

              <p class="mt-2 text-sm text-gray-600">
                {{ journal.description }}
              </p>

              <div class="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <UIcon name="i-heroicons-calendar" />
                <span>{{ formatDate(journal.publish_date) }}</span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </UCard>
    </div>
  </div>
</template>
