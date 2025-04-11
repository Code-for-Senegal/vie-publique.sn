<script setup lang="ts">
const seoTitle = "Communiqué Conseil des ministres Sénégal";
const seoDescription =
  "Goouvernement du Sénégal, Communiqué conseil des ministres";
const seoImgPath = "/images/share-conseil-des-ministres-nomination-full.jfif";
const seoPageUrl = "https://vie-publique.sn/conseil-des-ministres";
const seoKeywords =
  "Conseil des ministres Sénégal, communiqué conseil des ministres, nomination gouvernement Sénégal";
useHead({
  meta: [{ name: "robots", content: "noindex" }],
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
    .filter(
      (code) =>
        code.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        code.content?.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

/* Pagination */

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
    <p class="text-center text-sm text-gray-600">
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

    <div v-if="pending" class="flex min-h-48 items-center justify-center">
      <UIcon
        name="i-heroicons-arrow-path"
        class="text-primary h-12 w-12 animate-spin"
      />
    </div>

    <div v-else-if="error" class="py-4 text-center text-red-500">
      Une erreur s'est produite lors du chargement des textes.
    </div>

    <div v-else>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="pressItem in rowsFilteredPressReleases"
          :key="pressItem._path"
          class="custom-shadow group rounded-none transition-shadow duration-300 hover:shadow-lg"
        >
          <NuxtLink :to="pressItem._path" class="block">
            <div class="mb-0 rounded-t-lg">
              <!-- <img
                :src="
                  pressItem.image ||
                  '/images/communique-conseil-des-ministres.jpeg'
                "
                :alt="pressItem.title"
                loading="lazy"
                fetchpriority="high"
                class="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              /> -->
              <NuxtImg
                :src="
                  pressItem.image ||
                  '/images/communique-conseil-des-ministres.jpeg'
                "
                :alt="pressItem.title"
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
                {{ pressItem.title }}
              </h2>
              <p class="mb-2 hidden text-xs text-gray-600">
                {{ $dateformatWithDayName(pressItem.date) }}
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

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
