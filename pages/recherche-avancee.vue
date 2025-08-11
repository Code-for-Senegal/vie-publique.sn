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
  getTypeBadgeColor,
  toggleType,
} = useSearchEnhanced();

// Types disponibles pour les filtres
const availableTypes = [
  { value: "document", label: "Documents", icon: "i-heroicons-document-text" },
  { value: "actualite", label: "Actualités", icon: "i-heroicons-newspaper" },
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
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-4">
      <!-- En-tête de la page -->
      <div class="mb-8 text-center">
        <h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Recherche Avancée
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Explorez nos données et documents
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
              placeholder: 'placeholder-gray-400 dark:placeholder-gray-500',
            }"
            :loading="loading"
            @keyup.enter="performSearch"
          />
          <div
            v-if="searchQuery"
            class="absolute right-3 top-1/2 -translate-y-1/2"
          >
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
        <div
          v-if="loading"
          class="mt-2 text-center text-xs text-gray-500 dark:text-gray-400"
        >
          <UIcon name="i-heroicons-arrow-path" class="mr-1 animate-spin" />
          Recherche en cours...
        </div>
      </div>

      <!-- Layout principal avec sidebar -->
      <div class="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <!-- Sidebar des filtres (Desktop) -->
        <aside class="hidden flex-shrink-0 lg:block lg:w-64">
          <div
            class="sticky top-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
          >
            <div class="mb-4 flex items-center justify-between">
              <h2 class="font-semibold text-gray-900 dark:text-white">
                Filtres
              </h2>
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
              <h3
                class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Type de contenu
              </h3>
              <div class="space-y-2">
                <label
                  v-for="type in availableTypes"
                  :key="type.value"
                  class="flex cursor-pointer items-center rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    :checked="selectedTypes.includes(type.value)"
                    @change="toggleType(type.value)"
                    class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                  />
                  <UIcon :name="type.icon" class="ml-2 mr-2 text-gray-500" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    {{ type.label }}
                  </span>
                </label>
              </div>
            </div>

            <!-- Statistiques dans la sidebar -->
            <!-- <div
              v-if="hasSearched"
              class="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700"
            >
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400"
                    >Résultats:</span
                  >
                  <span class="font-medium text-gray-900 dark:text-white">{{
                    totalResults
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400"
                    >Total indexé:</span
                  >
                  <span class="font-medium text-gray-900 dark:text-white">{{
                    totalIndexed
                  }}</span>
                </div>
              </div>
            </div> -->
          </div>
        </aside>

        <!-- Filtres mobiles intégrés -->
        <div class="lg:hidden">
          <div
            class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <!-- Titre et bouton effacer -->
            <div class="mb-3 flex items-center justify-between">
              <h3
                class="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200"
              >
                <UIcon name="i-heroicons-funnel" class="mr-2 text-gray-500" />
                Filtrer par type
              </h3>
              <UButton
                v-if="selectedTypes.length > 0"
                @click="clearAllFilters"
                size="xs"
                color="red"
                variant="ghost"
                icon="i-heroicons-x-mark"
                class="text-red-600 hover:text-red-700"
              />
            </div>

            <!-- Filtres en boutons toggle -->
            <div class="mb-3 grid grid-cols-2 gap-2">
              <UButton
                v-for="type in availableTypes"
                :key="type.value"
                @click="toggleType(type.value)"
                :color="selectedTypes.includes(type.value) ? 'primary' : 'gray'"
                :variant="selectedTypes.includes(type.value) ? 'solid' : 'soft'"
                size="sm"
                block
                class="justify-center transition-all duration-200"
              >
                <UIcon :name="type.icon" class="mr-1.5" />
                {{ type.label }}
              </UButton>
            </div>

            <!-- Compteur de filtres actifs -->
            <div v-if="selectedTypes.length > 0" class="mb-3">
              <div class="flex items-center justify-center">
                <span
                  class="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-full px-2 py-1 text-xs font-medium"
                >
                  {{ selectedTypes.length }} filtre{{
                    selectedTypes.length > 1 ? "s" : ""
                  }}
                  actif{{ selectedTypes.length > 1 ? "s" : "" }}
                </span>
              </div>
            </div>

            <!-- Indication de filtres actifs seulement -->
            <div
              v-if="selectedTypes.length > 0 && !hasSearched"
              class="border-t border-gray-100 pt-3 dark:border-gray-700"
            >
              <div class="text-center">
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  Prêt à rechercher avec {{ selectedTypes.length }} filtre{{
                    selectedTypes.length > 1 ? "s" : ""
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Zone de contenu principal -->
        <div class="flex-1">
          <!-- Résultats de recherche -->
          <div v-if="hasSearched">
            <!-- État de chargement -->
            <div
              v-if="loading"
              class="flex flex-col items-center justify-center py-12"
            >
              <UIcon
                name="i-heroicons-arrow-path"
                class="mb-4 h-8 w-8 animate-spin text-gray-400"
              />
              <p class="text-gray-600 dark:text-gray-400">
                Recherche en cours...
              </p>
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
                    <span
                      class="font-semibold text-blue-600 dark:text-blue-400"
                    >
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
                <p
                  class="mb-2 text-lg font-medium text-gray-900 dark:text-white"
                >
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
                  class="overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
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
                          class="mb-1.5 line-clamp-2 text-base font-semibold text-gray-900 transition-colors hover:text-blue-600 sm:text-lg dark:text-white dark:hover:text-blue-400"
                          v-html="result.highlightedTitle"
                        />

                        <!-- Extrait avec highlighting -->
                        <p
                          class="mb-2 line-clamp-2 text-xs text-gray-600 sm:line-clamp-3 sm:text-sm lg:line-clamp-4 lg:text-base dark:text-gray-400"
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
                          <!-- Date à gauche -->
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
                              getTypeBadgeColor(
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
          <div
            v-else
            class="rounded-lg bg-white p-12 shadow-sm dark:bg-gray-800"
          >
            <div class="mx-auto max-w-md text-center">
              <UIcon
                name="i-heroicons-magnifying-glass-circle"
                class="mx-auto mb-6 h-16 w-16 text-gray-400 dark:text-gray-500"
              />
              <h2
                class="mb-2 text-xl font-semibold text-gray-900 dark:text-white"
              >
                Commencez votre recherche
              </h2>
              <p class="mb-6 text-gray-600 dark:text-gray-400">
                Explorez nos contenus en utilisant la barre de recherche
                ci-dessus ou en sélectionnant des filtres
              </p>

              <!-- Suggestions de recherche -->
              <div class="text-left">
                <p
                  class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Recherches populaires:
                </p>
                <div class="flex flex-wrap gap-2">
                  <UButton
                    v-for="suggestion in [
                      'Budget 2024',
                      'Assemblée Nationale',
                      'Élections',
                      'Décrets',
                    ]"
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
