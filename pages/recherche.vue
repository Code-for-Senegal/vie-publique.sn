<script setup lang="ts">
// Configuration SEO
useHead({
  title: "Recherche - Vie-Publique.sn",
  meta: [
    {
      name: "description",
      content:
        "Recherchez dans les actualités et documents de la République du Sénégal",
    },
  ],
});

// Utilisation du composable de recherche
const {
  searchQuery,
  searchResults,
  totalResults,
  loading,
  currentPage,
  hasSearched,
  performSearch,
  totalPages,
} = useSearch();

// Fonction pour formater les dates Unix timestamp
const formatUnixDate = (timestamp: number | string) => {
  if (!timestamp) return "";
  
  // Convertir en nombre si c'est une string
  const ts = typeof timestamp === "string" ? parseInt(timestamp) : timestamp;
  
  // Créer une date à partir du timestamp Unix (en millisecondes)
  const date = new Date(ts * 1000);
  
  // Options de formatage
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  
  // Formater en français
  return date.toLocaleDateString("fr-FR", options);
};

</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- En-tête de la page -->
    <div class="prose prose-sm sm:prose dark:prose-invert mx-auto mb-8">
      <h1 class="text-center dark:text-white">Recherche</h1>
      <p class="text-center text-gray-600 dark:text-gray-400">
        Recherchez dans nos actualités et documents
      </p>
    </div>

    <!-- Champ de recherche -->
    <div class="mx-auto mb-8 max-w-2xl">
      <UInput
        v-model="searchQuery"
        size="lg"
        placeholder="Tapez votre recherche..."
        icon="i-heroicons-magnifying-glass"
        class="w-full"
        clearable
        :loading="loading"
        @keyup.enter="performSearch"
      />
    </div>

    <!-- Résultats de recherche -->
    <div v-if="hasSearched" class="mx-auto max-w-4xl">
      <!-- État de chargement -->
      <div v-if="loading" class="text-center">
        <UIcon
          name="i-heroicons-arrow-path"
          class="mx-auto h-8 w-8 animate-spin text-gray-400"
        />
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Recherche en cours...
        </p>
      </div>

      <!-- Résultats -->
      <div v-else>
        <!-- Statistiques -->
        <div class="mb-6 text-center">
          <p class="text-gray-600 dark:text-gray-400">
            {{ totalResults }} résultat{{
              totalResults > 1 ? "s" : ""
            }}
            trouvé{{ totalResults > 1 ? "s" : "" }} pour
            <span class="font-semibold">"{{ searchQuery }}"</span>
          </p>
        </div>

        <!-- Aucun résultat -->
        <div
          v-if="totalResults === 0"
          class="mt-8 flex flex-col items-center text-center text-gray-500 dark:text-gray-400"
        >
          <UIcon
            name="i-heroicons-exclamation-circle"
            class="mb-4 h-16 w-16 text-gray-400 dark:text-gray-500"
          />
          <p class="text-xl">Aucun résultat trouvé</p>
          <p class="mt-2 text-sm">
            Essayez avec d'autres mots-clés ou vérifiez l'orthographe
          </p>
        </div>

        <!-- Liste des résultats -->
        <div v-else class="space-y-6">
          <UCard
            v-for="result in searchResults"
            :key="result.document?.id"
            class="custom-shadow group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border dark:border-gray-800 dark:bg-gray-900/50 dark:backdrop-blur-sm"
          >
            <NuxtLink :to="result.formattedUrl || '/actualites'" class="block">
              <div class="flex gap-4">
                <!-- Image -->
                <div class="flex-shrink-0">
                  <CmsImage
                    :src="result.document?.cover_image"
                    :alt="result.document?.title || 'Image actualité'"
                    :quality="50"
                    :fallback="'/default-image-2.gif'"
                    class="h-24 w-32 rounded-lg object-cover"
                    loading="lazy"
                    fetchpriority="high"
                    sizes="128px"
                    :placeholder="[128, 96]"
                  />
                </div>

                <!-- Contenu -->
                <div class="flex-1">
                  <h2
                    class="group-hover:text-primary line-clamp-2 font-semibold transition-colors dark:text-gray-100"
                  >
                    {{ result.document?.title }}
                  </h2>

                  <!-- Extrait avec mise en surbrillance -->
                  <p
                    v-if="result.highlights?.content_html"
                    class="mt-2 text-sm text-gray-600 dark:text-gray-400"
                    v-html="result.highlights.content_html"
                  />
                  <p
                    v-else-if="result.document?.content_html"
                    class="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400"
                  >
                    {{ result.document.content_html.substring(0, 200) }}...
                  </p>

                  <!-- Métadonnées -->
                  <div
                    class="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400"
                  >
                    <span v-if="result.document?.category?.name">
                      {{ result.document.category.name }}
                    </span>
                    <span v-if="result.document?.date_published">
                      {{ formatUnixDate(result.document.date_published) }}
                    </span>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </UCard>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-8 flex justify-center">
          <UPagination
            v-model="currentPage"
            :total="totalResults"
            :default-page="1"
            :show-edges="true"
            :sibling-count="2"
            :active-button="{ color: 'yellow' }"
            :ui="{
              wrapper: 'flex items-center gap-1',
              base: 'min-w-8 min-h-8 flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
              active: 'bg-gray-900 text-white dark:bg-gray-700',
              inactive:
                'bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
            }"
          />
        </div>
      </div>
    </div>

    <!-- État initial -->
    <div
      v-else
      class="mx-auto mt-16 max-w-2xl text-center text-gray-500 dark:text-gray-400"
    >
      <UIcon
        name="i-heroicons-magnifying-glass"
        class="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-gray-500"
      />
      <p class="text-xl">Commencez votre recherche</p>
      <p class="mt-2 text-sm">
        Tapez votre requête dans le champ ci-dessus pour rechercher dans nos
        actualités
      </p>
    </div>
  </div>
</template>
