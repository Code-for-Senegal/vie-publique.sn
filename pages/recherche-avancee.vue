<script setup lang="ts">
// Configuration SEO
useHead({
  title: "Recherche Avancée - Vie-Publique.sn",
  meta: [
    {
      name: "description",
      content: "Recherche avancée dans les actualités et documents officiels de la République du Sénégal avec filtres et fonctionnalités étendues",
    },
  ],
});

// Utilisation du composable de recherche amélioré
const {
  searchQuery,
  searchResults,
  totalResults,
  totalIndexed,
  loading,
  currentPage,
  hasSearched,
  selectedTypes,
  performSearch,
  totalPages,
  getTypeBadgeColor,
  toggleType
} = useSearchEnhanced();

// Types disponibles pour les filtres
const availableTypes = [
  { value: 'document', label: 'Documents', icon: 'i-heroicons-document-text' },
  { value: 'actualite', label: 'Actualités', icon: 'i-heroicons-newspaper' }
];

// Fonction pour formater les dates Unix timestamp
const formatUnixDate = (timestamp: number | string) => {
  if (!timestamp) return "";
  const ts = typeof timestamp === "string" ? parseInt(timestamp) : timestamp;
  const date = new Date(ts * 1000);
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  
  return date.toLocaleDateString("fr-FR", options);
};

// Fonction pour effacer tous les filtres
const clearAllFilters = () => {
  selectedTypes.value = [];
};

// État du menu mobile
const isMobileMenuOpen = ref(false);
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <!-- En-tête de la page -->
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Recherche Avancée
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Explorez nos actualités et documents avec des outils de recherche puissants
        </p>
      </div>

      <!-- Barre de recherche principale -->
      <div class="mx-auto mb-8 max-w-3xl">
        <div class="relative">
          <UInput
            v-model="searchQuery"
            size="xl"
            placeholder="Rechercher dans tous les contenus..."
            icon="i-heroicons-magnifying-glass"
            class="w-full"
            :ui="{
              wrapper: 'relative',
              base: 'pl-12 pr-4 py-3 text-base',
              rounded: 'rounded-xl',
              placeholder: 'placeholder-gray-400 dark:placeholder-gray-500'
            }"
            :loading="loading"
            @keyup.enter="performSearch"
          />
          <div v-if="searchQuery" class="absolute right-3 top-1/2 -translate-y-1/2">
            <UButton
              @click="searchQuery = ''"
              icon="i-heroicons-x-mark"
              size="xs"
              color="gray"
              variant="ghost"
              :ui="{ rounded: 'rounded-full' }"
            />
          </div>
        </div>

        <!-- Recherche en temps réel indicator -->
        <div v-if="loading" class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin mr-1" />
          Recherche en cours...
        </div>
      </div>

      <!-- Layout principal avec sidebar -->
      <div class="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        <!-- Sidebar des filtres (Desktop) -->
        <aside class="hidden lg:block lg:w-64 flex-shrink-0">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-semibold text-gray-900 dark:text-white">Filtres</h2>
              <UButton
                v-if="selectedTypes.length > 0"
                @click="clearAllFilters"
                size="xs"
                color="gray"
                variant="ghost"
                label="Effacer"
              />
            </div>

            <!-- Filtre par type -->
            <div class="space-y-3">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de contenu
              </h3>
              <div class="space-y-2">
                <label
                  v-for="type in availableTypes"
                  :key="type.value"
                  class="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    :checked="selectedTypes.includes(type.value)"
                    @change="toggleType(type.value)"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <UIcon :name="type.icon" class="ml-2 mr-2 text-gray-500" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    {{ type.label }}
                  </span>
                </label>
              </div>
            </div>

            <!-- Statistiques dans la sidebar -->
            <div v-if="hasSearched" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Résultats:</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ totalResults }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Total indexé:</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ totalIndexed }}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Bouton filtres mobile -->
        <div class="lg:hidden mb-4">
          <UButton
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            icon="i-heroicons-adjustments-horizontal"
            color="white"
            variant="outline"
            block
          >
            Filtres
            <template v-if="selectedTypes.length > 0">
              ({{ selectedTypes.length }})
            </template>
          </UButton>
        </div>

        <!-- Menu filtres mobile -->
        <USlideover v-model="isMobileMenuOpen" side="left">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-semibold">Filtres</h2>
              <UButton
                @click="isMobileMenuOpen = false"
                icon="i-heroicons-x-mark"
                color="gray"
                variant="ghost"
                size="sm"
              />
            </div>

            <!-- Contenu des filtres mobile -->
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Type de contenu
                </h3>
                <div class="space-y-2">
                  <label
                    v-for="type in availableTypes"
                    :key="type.value"
                    class="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <input
                      type="checkbox"
                      :checked="selectedTypes.includes(type.value)"
                      @change="toggleType(type.value)"
                      class="w-4 h-4 text-blue-600"
                    />
                    <UIcon :name="type.icon" class="ml-3 mr-2 text-gray-500" />
                    <span class="text-sm">{{ type.label }}</span>
                  </label>
                </div>
              </div>

              <UButton
                v-if="selectedTypes.length > 0"
                @click="clearAllFilters"
                color="gray"
                variant="soft"
                block
              >
                Effacer tous les filtres
              </UButton>
            </div>
          </div>
        </USlideover>

        <!-- Zone de contenu principal -->
        <div class="flex-1">
          <!-- Résultats de recherche -->
          <div v-if="hasSearched">
            <!-- État de chargement -->
            <div v-if="loading" class="flex flex-col items-center justify-center py-12">
              <UIcon
                name="i-heroicons-arrow-path"
                class="h-8 w-8 animate-spin text-gray-400 mb-4"
              />
              <p class="text-gray-600 dark:text-gray-400">
                Recherche en cours...
              </p>
            </div>

            <!-- Résultats -->
            <div v-else>
              <!-- Statistiques en haut des résultats -->
              <div class="mb-6 flex items-center justify-between">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  <span class="font-semibold text-gray-900 dark:text-white">
                    {{ totalResults }}
                  </span>
                  résultat{{ totalResults > 1 ? "s" : "" }}
                  <template v-if="searchQuery">
                    pour
                    <span class="font-semibold text-gray-900 dark:text-white">
                      "{{ searchQuery }}"
                    </span>
                  </template>
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500">
                  {{ totalIndexed }} documents indexés
                </p>
              </div>

              <!-- Aucun résultat -->
              <div
                v-if="totalResults === 0"
                class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center"
              >
                <UIcon
                  name="i-heroicons-magnifying-glass"
                  class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4"
                />
                <p class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucun résultat trouvé
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Essayez de modifier votre recherche ou vos filtres
                </p>
              </div>

              <!-- Liste des résultats -->
              <div v-else class="space-y-4">
                <UCard
                  v-for="result in searchResults"
                  :key="result.document?.id"
                  class="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  :ui="{
                    body: {
                      padding: 'p-0'
                    }
                  }"
                >
                  <NuxtLink :to="result.formattedUrl || '/actualites'" class="block p-6">
                    <div class="flex flex-col sm:flex-row gap-4">
                      <!-- Image (responsive) -->
                      <div class="flex-shrink-0">
                        <NuxtImg
                          :src="
                            result.document?.cover_image
                              ? $directusImageUrl(result.document.cover_image, '50')
                              : '/default-image-2.gif'
                          "
                          :alt="result.document?.title || 'Image actualité'"
                          class="w-full sm:w-32 h-32 sm:h-24 rounded-lg object-cover"
                          loading="lazy"
                          fetchpriority="high"
                          sizes="128px"
                          :placeholder="[128, 96]"
                        />
                      </div>

                      <!-- Contenu -->
                      <div class="flex-1">
                        <!-- Titre avec highlighting -->
                        <h3
                          class="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          v-html="result.highlightedTitle"
                        />

                        <!-- Badge de type -->
                        <div class="flex items-center gap-2 mb-2">
                          <span
                            v-if="result.document?.type || result.document?.category?.name"
                            :class="getTypeBadgeColor(result.document?.type || result.document?.category?.slug)"
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                          >
                            <UIcon
                              :name="result.document?.type === 'document' ? 'i-heroicons-document-text' : 'i-heroicons-newspaper'"
                              class="mr-1 h-3 w-3"
                            />
                            {{ result.document?.type || result.document?.category?.name }}
                          </span>
                          
                          <span
                            v-if="result.document?.date_published"
                            class="text-xs text-gray-500 dark:text-gray-400"
                          >
                            {{ formatUnixDate(result.document.date_published) }}
                          </span>
                        </div>

                        <!-- Extrait avec highlighting -->
                        <p
                          class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3"
                          v-html="result.highlightedContent"
                        />
                      </div>
                    </div>
                  </NuxtLink>
                </UCard>
              </div>

              <!-- Pagination améliorée -->
              <div v-if="totalPages > 1" class="mt-8">
                <UPagination
                  v-model="currentPage"
                  :page-count="10"
                  :total="totalResults"
                  :ui="{
                    wrapper: 'flex items-center justify-center gap-1',
                    base: 'min-w-[2.5rem] min-h-[2.5rem] flex items-center justify-center rounded-lg font-medium',
                    active: 'bg-blue-600 text-white',
                    inactive: 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }"
                />
                
                <!-- Info pagination -->
                <p class="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Page {{ currentPage }} sur {{ totalPages }}
                </p>
              </div>
            </div>
          </div>

          <!-- État initial avec suggestions -->
          <div
            v-else
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12"
          >
            <div class="max-w-md mx-auto text-center">
              <UIcon
                name="i-heroicons-magnifying-glass-circle"
                class="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-6"
              />
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Commencez votre recherche
              </h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Explorez nos contenus en utilisant la barre de recherche ci-dessus ou en sélectionnant des filtres
              </p>
              
              <!-- Suggestions de recherche -->
              <div class="text-left">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Recherches populaires:
                </p>
                <div class="flex flex-wrap gap-2">
                  <UButton
                    v-for="suggestion in ['Budget 2024', 'Assemblée Nationale', 'Élections', 'Décrets']"
                    :key="suggestion"
                    @click="searchQuery = suggestion"
                    size="xs"
                    color="gray"
                    variant="soft"
                  >
                    {{ suggestion }}
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animation pour le chargement */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Style pour le highlighting */
:deep(mark) {
  background-color: #fef3c7;
  padding: 0 0.125rem;
  border-radius: 0.125rem;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .line-clamp-3 {
    -webkit-line-clamp: 2;
  }
}
</style>