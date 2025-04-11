<!-- index.vue -->
<script setup lang="ts">
const { journaux, loading, error } = useJournalOfficial();
const searchQuery = ref("");
const currentView = ref<"grid" | "list">("list");

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

interface Document {
  id: string;
  status: string;
  title: string;
  description: string;
  publish_date: string;
  content_html: string;
  file?: string;
}

interface Journal {
  id: string;
  number: string;
  type: "special" | "ordinary";
  status: string;
  slug: string;
  document: Document;
}

const filteredJournals = computed(() => {
  if (!journaux.value) return [];

  return journaux.value.filter((journal: Journal) => {
    const searchLower = searchQuery.value.toLowerCase();
    return (
      journal.document.title?.toLowerCase().includes(searchLower) ||
      journal.number?.toString().toLowerCase().includes(searchLower) ||
      journal.document.description?.toLowerCase().includes(searchLower)
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
    <!-- En-tête -->
    <div class="prose prose-sm sm:prose mx-auto my-4">
      <h1 class="text-center">Journal Officiel du Sénégal</h1>
    </div>

    <!-- Barre d'outils -->
    <div class="mb-6 space-y-2">
      <!-- Statistiques -->
      <div class="text-center">
        <UBadge size="sm" color="gray" class="custom-shadow">
          {{ filteredJournals.length }} Journaux référencés
        </UBadge>
      </div>

      <!-- Recherche -->
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <UInput
          v-model="searchQuery"
          size="lg"
          placeholder="Rechercher par numéro, date ou contenu..."
          icon="i-heroicons-magnifying-glass"
          class="custom-shadow sm:w-full"
        />
      </div>
    </div>

    <!-- Loading state -->
    <UCard v-if="loading" class="p-8 text-center">
      <UProgress />
      <p class="mt-4">Chargement des journaux officiels...</p>
    </UCard>

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
          :to="`/journal-officiel-senegal/${journal.slug}`"
          class="block"
        >
          <div class="flex gap-4">
            <div
              class="w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
            >
              <img
                src="/images/default-journal-officiel.webp"
                :alt="`Aperçu JO ${journal.number}`"
                class="h-full w-full object-cover"
                loading="lazy"
                fetchpriority="high"
              />
            </div>

            <div>
              <div class="flex items-start justify-between gap-4">
                <h3 class="text-primary font-semibold">
                  {{ journal.document.title }}
                </h3>
              </div>

              <p class="mt-2 text-sm text-gray-600">
                {{ journal.document.description }}
              </p>

              <div class="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <UIcon name="i-heroicons-calendar" />
                <span>{{ formatDate(journal.document.publish_date) }}</span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </UCard>
    </div>
  </div>
</template>
