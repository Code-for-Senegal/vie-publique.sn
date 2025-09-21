<script setup lang="ts">
// Configuration SEO
useHead({
  title: "Recherche Avancée - Vie-Publique.sn",
  meta: [
    {
      name: "description",
      content:
        "Recherche avancée dans les actualités et documents officiels de la République du Sénégal avec filtres et fonctionnalités étendues",
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
  toggleType,
  resultCountsByType,
} = useSearchEnhanced();

// Types disponibles pour les filtres
const availableTypes = [
  {
    value: "document",
    label: "Documents",
    icon: "i-heroicons-document-text",
    color:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
  },
  {
    value: "actualite",
    label: "Actualités",
    icon: "i-heroicons-newspaper",
    color:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700",
  },
];

// Fonction pour formater les dates Unix timestamp (sans le jour de la semaine)
const formatUnixDate = (timestamp: number | string) => {
  if (!timestamp) return "";
  const ts = typeof timestamp === "string" ? parseInt(timestamp) : timestamp;
  const date = new Date(ts * 1000);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleDateString("fr-FR", options);
};

// Fonction pour effacer tous les filtres (commentée car non utilisée)
// const clearAllFilters = () => {
//   selectedTypes.value = [];
// };

// Fonction pour obtenir la couleur du badge selon le type
const getBadgeColor = (type: string) => {
  if (type === "document") {
    return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
  } else if (type === "actualite") {
    return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700";
  }
  // Couleur par défaut pour les autres types
  return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
};

// Composant Skeleton pour les résultats - défini dans le template
</script>

<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-4 py-4">
      <!-- En-tête de la page (masqué après recherche) -->
      <div v-if="!hasSearched" class="mb-8 text-center">
        <h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Recherche
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Explorez nos données et documents
        </p>
      </div>

      <!-- Barre de recherche principale -->
      <div class="mx-auto mb-6">
        <div class="group relative">
          <div class="relative">
            <UIcon
              name="i-heroicons-magnifying-glass"
              class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher dans tous les contenus..."
              class="custom-shadow w-full rounded-xl border border-gray-200 py-4 pl-12 pr-16 text-base transition-all duration-200 placeholder:text-gray-400 hover:shadow-md focus:border-blue-500 focus:shadow-lg focus:outline-none focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400"
              @keyup.enter="performSearch"
            />
            <!-- Boutons d'action dans le champ -->
            <div
              class="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1"
            >
              <!-- Bouton effacer -->
              <UButton
                v-if="searchQuery"
                @click="searchQuery = ''"
                icon="i-heroicons-x-mark"
                size="sm"
                color="gray"
                variant="ghost"
                class="rounded-full"
              />
              <!-- Bouton rechercher -->
              <UButton
                v-if="searchQuery.trim()"
                @click="performSearch"
                size="sm"
                variant="outline"
                icon="i-heroicons-magnifying-glass"
                class="rounded-full"
                :disabled="loading"
              />
            </div>
          </div>
        </div>

        <!-- Recherche en temps réel indicator -->
        <div
          v-if="loading"
          class="mt-2 text-center text-xs text-gray-500 dark:text-gray-400"
        >
          <UIcon name="i-heroicons-arrow-path" class="mr-1 animate-spin" />
          Recherche en cours...
        </div>
      </div>

      <!-- Filtres directement sous la recherche -->
      <div class="mb-4">
        <div class="flex gap-4">
          <div
            v-for="type in availableTypes"
            :key="type.value"
            @click="toggleType(type.value)"
            :class="[
              'flex cursor-pointer items-center rounded-lg px-4 py-2 transition-all duration-200 hover:scale-105',
              selectedTypes.includes(type.value)
                ? type.color
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600',
            ]"
          >
            <UIcon
              :name="type.icon"
              :class="[
                'mr-2 h-4 w-4',
                selectedTypes.includes(type.value)
                  ? 'text-current'
                  : 'text-gray-500 dark:text-gray-400',
              ]"
            />
            <span
              :class="[
                'text-xs font-medium',
                selectedTypes.includes(type.value)
                  ? 'text-current'
                  : 'text-gray-700 dark:text-gray-300',
              ]"
            >
              {{ type.label }}
              <span
                v-if="hasSearched && resultCountsByType[type.value] > 0"
                class="ml-1 inline-flex items-center justify-center rounded-full bg-white/30 px-1.5 py-0.5 text-xs font-semibold"
              >
                {{ resultCountsByType[type.value] }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- Zone de contenu principal (pleine largeur) -->
      <div class="mx-auto max-w-6xl">
        <!-- Résultats de recherche -->
        <div v-if="hasSearched">
          <!-- État de chargement avec skeleton -->
          <div v-if="loading" class="space-y-4">
            <div v-for="i in 6" :key="i" class="animate-pulse">
              <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                <div class="flex gap-3">
                  <div class="flex-shrink-0">
                    <div
                      class="h-20 w-20 rounded-lg bg-gray-200 sm:w-32 lg:h-28 lg:w-36 dark:bg-gray-700"
                    ></div>
                  </div>
                  <div class="flex-1 space-y-3">
                    <div
                      class="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"
                    ></div>
                    <div class="space-y-2">
                      <div
                        class="h-3 w-full rounded bg-gray-200 dark:bg-gray-700"
                      ></div>
                      <div
                        class="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700"
                      ></div>
                    </div>
                    <div class="flex items-center justify-between pt-2">
                      <div
                        class="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700"
                      ></div>
                      <div
                        class="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Résultats -->
          <div v-else>
            <!-- Statistiques simplifiées -->
            <div class="mb-6">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                <span class="font-semibold text-gray-900 dark:text-white">
                  {{ totalResults }}
                </span>
                résultat{{ totalResults > 1 ? "s" : "" }}
                <template v-if="searchQuery">
                  pour
                  <span class="font-semibold text-blue-600 dark:text-blue-400">
                    "{{ searchQuery }}"
                  </span>
                </template>
                <span class="text-xs text-gray-500">
                  sur {{ totalIndexed }} données indexées
                </span>
              </p>
            </div>

            <!-- Aucun résultat -->
            <div
              v-if="totalResults === 0"
              class="rounded-lg bg-white p-12 text-center shadow-sm dark:bg-gray-800"
            >
              <UIcon
                name="i-heroicons-magnifying-glass"
                class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500"
              />
              <p class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
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
                class="custom-shadow overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border dark:border-gray-800 dark:bg-gray-900/50"
                :ui="{
                  body: {
                    padding: 'p-0',
                  },
                }"
              >
                <NuxtLink
                  :to="result.formattedUrl || '/actualites'"
                  class="block p-4 sm:p-0"
                >
                  <div class="flex gap-3">
                    <!-- Image (toujours à côté, même sur mobile) -->
                    <div class="flex-shrink-0">
                      <NuxtImg
                        :src="
                          result.document?.cover_image
                            ? $directusImageUrl(
                                result.document.cover_image,
                                '50',
                              )
                            : '/default-image-2.gif'
                        "
                        :alt="result.document?.title || 'Image actualité'"
                        class="h-20 w-20 rounded-lg object-cover sm:h-20 sm:w-32 lg:h-28 lg:w-36"
                        loading="lazy"
                        sizes="80px sm:128px lg:144px"
                        :placeholder="[80, 80]"
                      />
                    </div>

                    <!-- Contenu -->
                    <div class="flex-1">
                      <!-- Titre avec highlighting -->
                      <h3
                        class="mb-1.5 line-clamp-2 font-semibold text-gray-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                        v-html="result.highlightedTitle"
                      />

                      <!-- Extrait avec highlighting -->
                      <p
                        class="mb-2 line-clamp-2 text-xs text-gray-600 sm:line-clamp-3 sm:text-sm lg:line-clamp-4 dark:text-gray-400"
                        v-html="result.highlightedContent"
                      />

                      <!-- Date et badge sur la même ligne -->
                      <div
                        v-if="
                          result.document?.date_published ||
                          result.document?.type ||
                          result.document?.category?.name
                        "
                        class="mt-2 flex items-center justify-between border-t border-gray-100 pt-1 sm:mt-1 dark:border-gray-700"
                      >
                        <!-- Date à gauche (sans le jour de la semaine) -->
                        <span
                          v-if="result.document?.date_published"
                          class="text-xs text-gray-500 sm:text-sm dark:text-gray-400"
                        >
                          {{ formatUnixDate(result.document.date_published) }}
                        </span>

                        <!-- Badge de type à droite -->
                        <span
                          v-if="
                            result.document?.type ||
                            result.document?.category?.name
                          "
                          :class="
                            getBadgeColor(
                              result.document?.type ||
                                result.document?.category?.slug,
                            )
                          "
                          class="inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium"
                        >
                          <UIcon
                            :name="
                              result.document?.type === 'document'
                                ? 'i-heroicons-document-text'
                                : 'i-heroicons-newspaper'
                            "
                            class="mr-1 h-3 w-3"
                          />
                          {{
                            result.document?.type ||
                            result.document?.category?.name
                          }}
                        </span>
                      </div>
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
                  inactive:
                    'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
                }"
              />

              <!-- Info pagination -->
              <p
                class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                Page {{ currentPage }} sur {{ totalPages }}
              </p>
            </div>
          </div>
        </div>

        <!-- État initial avec suggestions -->
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
          <!-- Suggestions de recherche comme Google Mobile -->
          <div class="mt-8">
            <p
              class="mb-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Recherches populaires
            </p>
            <div class="space-y-2">
              <div
                v-for="suggestion in [
                  'Budget 2024',
                  'Assemblée Nationale',
                  'Élections',
                  'Décrets',
                  'Lois et règlements',
                  'Communiqués de presse',
                  'Ministère de l\'Économie',
                  'Projets de développement',
                ]"
                :key="suggestion"
                @click="
                  searchQuery = suggestion;
                  performSearch();
                "
                class="flex cursor-pointer items-center rounded-lg bg-white p-3 transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <UIcon
                  name="i-heroicons-magnifying-glass"
                  class="mr-3 h-4 w-4 text-gray-400"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  {{ suggestion }}
                </span>
                <UIcon
                  name="i-heroicons-arrow-up-left"
                  class="ml-auto h-4 w-4 text-gray-400"
                />
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
  0%,
  100% {
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
