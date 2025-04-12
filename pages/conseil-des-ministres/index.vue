<!-- pages/conseil-des-ministres/index.vue -->
<script setup lang="ts">
import { useConseilMinistres } from "~/composables/useConseilMinistres";
import { useConseilMinistresStore } from "~/stores/conseilMinistres";
import { useDebounceFn } from "@vueuse/core";

const seoTitle = "Communiqué Conseil des ministres Sénégal";
const seoDescription =
  "Gouvernement du Sénégal, Communiqué conseil des ministres";
const seoImgPath = "/images/share-conseil-des-ministres-nomination-full.jfif";
const seoPageUrl = "https://vie-publique.sn/conseil-des-ministres";
const seoKeywords =
  "Conseil des ministres Sénégal, communiqué conseil des ministres, nomination gouvernement Sénégal";

useHead({
  title: seoTitle,
  meta: [
    {
      name: "description",
      content: seoDescription,
    },
    {
      name: "keywords",
      content: seoKeywords,
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

const store = useConseilMinistresStore();
const { news, loading, error, updateSearch, updatePage } =
  useConseilMinistres();

// Utiliser les valeurs du store
const searchQuery = computed({
  get: () => store.searchQuery,
  set: (value) => {
    store.setSearchQuery(value);
    store.setCurrentPage(1);
    debouncedSearch(value);
  },
});

const currentPage = computed({
  get: () => store.currentPage,
  set: (value) => {
    store.setCurrentPage(value);
    updatePage(value);
  },
});

// Debounce pour la recherche
const debouncedSearch = useDebounceFn((query: string) => {
  updateSearch(query);
}, 500);

// Texte pour l'affichage du nombre de résultats
const resultsText = computed(() => {
  const totalCount = store.totalItems;
  const currentPageStart = (store.currentPage - 1) * store.itemsPerPage + 1;
  const currentPageEnd = Math.min(
    currentPageStart + store.itemsPerPage - 1,
    totalCount,
  );

  const searchText = store.searchQuery ? ` pour "${store.searchQuery}"` : "";

  if (totalCount === 0) {
    return store.searchQuery
      ? `Aucun résultat trouvé${searchText}`
      : "Aucun résultat";
  }

  if (totalCount === 1) {
    return `1 Communiqué trouvé${searchText}`;
  }

  if (totalCount <= store.itemsPerPage) {
    return `${totalCount} Communiqués trouvés${searchText}`;
  }

  return `${currentPageStart}-${currentPageEnd} sur ${totalCount} communiqués${searchText}`;
});
</script>

<template>
  <div class="container mx-auto sm:px-4">
    <div class="prose prose-sm sm:prose mx-auto my-4">
      <h1
        class="from-primary-600 to-primary-500 bg-clip-text text-center text-xl font-bold sm:text-3xl"
      >
        Conseil des ministres
      </h1>
    </div>

    <div class="mb-8">
      <UInput
        v-model="searchQuery"
        placeholder="Rechercher un communiqué..."
        icon="i-heroicons-magnifying-glass"
        class="custom-shadow mx-auto w-full"
        size="lg"
      />
      <div
        class="mt-2 flex flex-col items-center justify-between text-sm text-gray-500 sm:flex-row"
      >
        <span>{{ resultsText }}</span>
      </div>
    </div>

    <div v-if="loading" class="flex min-h-48 items-center justify-center">
      <UIcon
        name="i-heroicons-arrow-path"
        class="text-primary h-12 w-12 animate-spin"
      />
    </div>

    <div v-else-if="error" class="py-4 text-center text-red-500">
      {{ error }}
    </div>

    <div v-else-if="news.length === 0" class="py-12 text-center">
      <UIcon
        name="i-heroicons-document-magnifying-glass"
        class="mx-auto mb-4 h-12 w-12 text-gray-400"
      />
      <h3 class="mb-2 text-lg font-medium text-gray-900">
        Aucun communiqué trouvé
      </h3>
      <p class="text-gray-500">Essayez de modifier vos critères de recherche</p>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="item in news"
          :key="item.id"
          class="group relative overflow-hidden rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <NuxtLink
            :to="`/conseil-des-ministres/${item.id}/${item.slug}`"
            class="block"
          >
            <div class="relative">
              <NuxtImg
                :src="
                  item.cover_image
                    ? $directusImageUrl(item.cover_image, '50')
                    : '/images/communique-conseil-des-ministres.jpeg'
                "
                :alt="item.title || 'Communiqué du conseil des ministres'"
                class="h-48 w-full object-cover"
                loading="lazy"
                fetchpriority="high"
                sizes="300px"
                :placeholder="[300, 300]"
              />
              <div
                class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4"
              >
                <p class="text-sm font-medium text-white">
                  {{
                    item.date_published
                      ? $dateformatWithDayName(item.date_published)
                      : ""
                  }}
                </p>
              </div>
            </div>

            <div class="p-2">
              <h2
                class="group-hover:text-primary line-clamp-2 font-semibold transition-colors"
              >
                {{ item.title || "Communiqué du conseil des ministres" }}
              </h2>

              <!-- <div
                class="text-primary mt-4 flex items-center opacity-0 transition-opacity group-hover:opacity-100"
              >
                <UIcon
                  name="i-heroicons-arrow-right"
                  class="ml-auto h-5 w-5 transition-transform group-hover:translate-x-2"
                />
              </div> -->
            </div>
          </NuxtLink>
        </UCard>
      </div>

      <div v-if="store.totalPages > 1" class="mt-8 flex justify-center">
        <UPagination
          v-model="currentPage"
          :total="store.totalItems"
          :default-page="1"
          :show-edges="true"
          :sibling-count="2"
          :active-button="{ color: 'yellow' }"
          :ui="{
            wrapper: 'flex items-center gap-1',
            base: 'min-w-8 min-h-8 flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
            active: 'bg-gray-900 text-white',
            inactive: 'bg-white text-gray-900 hover:bg-gray-100',
          }"
        />
      </div>
    </div>
  </div>
</template>
