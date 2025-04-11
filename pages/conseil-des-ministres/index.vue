<!-- pages/conseil-des-ministres/index.vue -->
<script setup lang="ts">
import { useNews } from "~/composables/news/useNews";

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

const searchQuery = ref("");
const { news, loading, error } = useNews({ category: "conseil-des-ministres" });

// Filtres
const filteredPressReleases = computed(() => {
  if (!news.value) return [];
  return news.value.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

// Pagination
const page = ref(1);
const pageCount = 9;

const rowsFilteredPressReleases = computed(() => {
  return filteredPressReleases.value.slice(
    (page.value - 1) * pageCount,
    page.value * pageCount,
  );
});

watch(searchQuery, () => {
  page.value = 1;
});
</script>

<template>
  <div class="container mx-auto sm:px-4">
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Conseil des ministres</h1>
    </div>
    <p v-if="!loading" class="text-center text-sm text-gray-600">
      {{ filteredPressReleases.length }} Communiqués référencés
    </p>

    <div class="mb-4">
      <UInput
        v-model="searchQuery"
        placeholder="Rechercher un communiqué..."
        icon="i-heroicons-magnifying-glass"
        class="mx-auto hidden w-full max-w-2xl"
      />
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

    <div v-else>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="item in rowsFilteredPressReleases"
          :key="item.id"
          class="custom-shadow group rounded-none transition-shadow duration-300 hover:shadow-lg"
        >
          <NuxtLink
            :to="`/conseil-des-ministres/${item.id}/${item.slug}`"
            class="block"
          >
            <div class="mb-0 rounded-t-lg">
              <NuxtImg
                :src="
                  $directusImageUrl(item.cover_image, '50') ||
                  '/images/communique-conseil-des-ministres.jpeg'
                "
                :alt="item.title"
                class="h-24 w-full object-cover sm:h-48"
                loading="lazy"
                fetchpriority="high"
                sizes="300px"
                :placeholder="[300, 300]"
              />
            </div>
            <div class="p-4">
              <h2
                class="group-hover:text-primary mb-2 text-lg font-semibold transition-colors"
              >
                {{ item.title }}
              </h2>
              <p class="mb-2 hidden text-xs text-gray-600">
                {{ $dateformatWithDayName(item.date_published) }}
              </p>
              <div class="text-primary mt-4 flex items-center">
                <span class="text-sm font-medium">Lire le communiqué</span>
                <UIcon
                  name="i-heroicons-arrow-right"
                  class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2"
                />
              </div>
            </div>
          </NuxtLink>
        </UCard>
      </div>

      <div class="mt-8 flex justify-center border-t border-gray-200 pt-6">
        <UPagination
          v-model="page"
          :page-count="Math.ceil(filteredPressReleases.length / pageCount)"
          :total="filteredPressReleases.length"
          class="justify-center"
        />
      </div>
    </div>
  </div>
</template>
