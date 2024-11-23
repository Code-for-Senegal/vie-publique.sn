<script setup lang="ts">
// Configuration des métadonnées pour le SEO et le partage social
const seoTitle = "Nos dossier d'enquêtes statistiques";
const seoDescription = "Information Actualités de la république du Sénégal";
const seoImgPath = "https://vie-publique.sn/images/share-linkedin.png";
const seoPageUrl = "https://vie-publique.sn/publications/actualites";
useHead({
  title: seoTitle,
  meta: [
    {
      name: "description",
      content: seoDescription,
    },
    // Twitter Card Meta Tags
    {
      name: "twitter:title",
      content: seoTitle,
    },
    {
      name: "twitter:description",
      content: seoDescription,
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: seoImgPath },
    // Open Graph Meta Tags
    {
      property: "og:title",
      content: seoTitle,
    },
    {
      property: "og:description",
      content: seoDescription,
    },
    { property: "og:image", content: seoImgPath },
    { property: "og:url", content: seoPageUrl },
    { property: "og:type", content: "website" },
  ],
});

const searchQuery = ref("");

const {
  data: contentItems,
  pending,
  error,
} = await useAsyncData(
  "contentItems",
  () => queryContent("publications/enquetes").find(),
  { server: true, lazy: false },
);

// Filtrage des actualités en fonction de la catégorie sélectionnée et Tri des actualités filtrées par date, du plus récent au plus ancien
const filteredSortedContentItems = computed(() => {
  if (!contentItems.value) return [];
  return contentItems.value
    .filter((code) =>
      code.title?.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});
</script>

<template>
  <div class="container mx-auto px-4">
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Enquêtes</h1>
    </div>

    <!-- Affichage du spinner pendant le chargement des données -->
    <div v-if="pending" class="py-8 text-center">
      <div
        class="h-20 w-20 animate-spin rounded-full border-8 border-gray-300 border-t-green-700"
      ></div>
      <!-- <p class="text-gray-600">Chargement des actualités...</p> -->
    </div>

    <!-- Affichage d'une alerte en cas d'erreur -->
    <UAlert
      v-else-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      title="Erreur de chargement"
      :description="error.message"
    />

    <!-- Affichage des actualités -->
    <div v-else>
      <!-- Message si aucun résultat n'est trouvé -->
      <div
        v-if="filteredSortedContentItems.length === 0"
        class="mt-8 flex flex-col items-center text-center text-gray-500"
      >
        <UIcon
          name="i-heroicons-exclamation-circle"
          class="mb-4 h-16 w-16 text-gray-400"
        />
        <p class="text-xl">Aucun résultat disponible</p>
      </div>

      <!-- Grille des actualités -->
      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="item in filteredSortedContentItems"
          :key="item._path"
          class="custom-shadow cursor-pointer"
        >
          <NuxtLink :to="item._path">
            <NuxtImg
              :src="item.image || '/default-image-2.gif'"
              :alt="item.title"
              class="mb-4 h-48 w-full object-cover"
              loading="lazy"
              fetchpriority="high"
              sizes="300px"
              :placeholder="[300, 300]"
            />
            <div
              class="siteweb-type my-1 inline-block bg-gray-200 px-2 py-1 text-xs text-gray-800"
            >
              {{ item.category }}
            </div>
            <div class="text-sm text-gray-800">
              {{ $dateformatWithDayName(item.date) }}
            </div>
            <p class="font-semibold">
              {{ item.title }}
            </p>
          </NuxtLink>
        </UCard>
      </div>
    </div>
  </div>
</template>
