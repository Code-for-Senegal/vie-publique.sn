<script setup lang="ts">
const seoTitle = "Communiqué Conseil des ministres Sénégal";
const seoDescription =
  "Goouvernement du Sénégal, Communiqué conseil des ministres";
const seoImgPath = "/images/share-conseil-des-ministres-nomination-full.jfif";
const seoPageUrl = "https://vie-publique.sn/conseil-des-ministres";
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

/* Get Datas */

const {
  data: codes,
  pending,
  error,
} = await useAsyncData(
  "codes",
  () => queryContent("conseil-des-ministres").find(),
  { server: true, lazy: false },
);

/* Filters */

const filteredPressReleases = computed(() => {
  if (!codes.value) return [];
  return codes.value
    .filter((code) =>
      code.title?.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

/* Pagination */

const page = ref(1);
const pageCount = 10;

const rowsFilteredPressReleases = computed(() => {
  return filteredPressReleases.value.slice(
    (page.value - 1) * pageCount,
    page.value * pageCount,
  );
});
</script>

<template>
  <div class="container mx-auto px-4">
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Conseil des ministres</h1>
    </div>

    <p class="mb-4 text-center text-sm text-gray-500">
      {{ filteredPressReleases.length }} Communiqués référencés
    </p>

    <!-- <UInput size="md" v-model="searchQuery" placeholder="Rechercher..." icon="i-heroicons-magnifying-glass"
      class="input w-full my-4 custom-shadow" /> -->

    <div v-if="pending">Chargement...</div>
    <div v-else-if="error">
      Une erreur s'est produite lors du chargement des textes.
    </div>
    <div v-else>
      <div class="flex flex-col gap-2">
        <UCard
          v-for="pressItem in rowsFilteredPressReleases"
          :key="pressItem._path"
          class="custom-shadow cursor-pointer"
        >
          <NuxtLink :to="pressItem._path" class="items-center font-semibold">
            <div>
              <span class="underline">{{ pressItem.title }}</span>
            </div>
            <p class="text-sm text-gray-500">
              {{ $dateformatWithDayName(pressItem.date) }}
            </p>
          </NuxtLink>
        </UCard>
      </div>

      <div
        class="flex justify-end border-t border-gray-200 px-3 py-3.5 dark:border-gray-700"
      >
        <UPagination
          v-model="page"
          size="md"
          :page-count="pageCount"
          :total="filteredPressReleases.length"
        />
      </div>
    </div>
  </div>
</template>
