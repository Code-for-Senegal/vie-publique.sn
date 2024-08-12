<script setup lang="ts">

const seoTitle = 'Communiqué Conseil des ministres Sénégal';
const seoDescription = 'Goouvernement du Sénégal, Communiqué conseil des ministres';
const seoImgPath = '/images/share-conseil-des-ministres-nomination-full.jfif';
const seoPageUrl = 'https://vie-publique.sn/conseil-des-ministres';
useHead({
  title: seoTitle,
  meta: [
    {
      name: 'description',
      content: seoDescription
    },
    // Twitter Card Meta Tags
    {
      name: "twitter:title",
      content: seoTitle
    },
    {
      name: "twitter:description",
      content: seoDescription
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
      content: seoDescription
    },
    { property: "og:image", content: seoImgPath },
    { property: "og:url", content: seoPageUrl },
    { property: "og:type", content: "website" },
  ]
})

const searchQuery = ref('')

/* Get Datas */

const { data: codes, pending, error } = await useAsyncData('codes', () =>
  queryContent('conseil-des-ministres').find(),
  { server: true, lazy: false }
)

/* Filters */

const filteredPressReleases = computed(() => {
  if (!codes.value) return []
  return codes.value.filter(code =>
    code.title?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

/* Pagination */

const page = ref(1)
const pageCount = 5

const rowsFilteredPressReleases = computed(() => {
  return filteredPressReleases.value.slice((page.value - 1) * pageCount, (page.value) * pageCount)
});
</script>

<template>
  <div class="container mx-auto px-4">

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">
        Conseil des ministres
      </h1>
    </div>

    <p class="text-sm mb-4 text-gray-500 text-center">
      {{ filteredPressReleases.length }} Communiqués référencés
    </p>

    <!-- <UInput size="md" v-model="searchQuery" placeholder="Rechercher..." icon="i-heroicons-magnifying-glass"
      class="input w-full my-4 custom-shadow" /> -->

    <div v-if="pending">Chargement...</div>
    <div v-else-if="error">Une erreur s'est produite lors du chargement des textes.</div>
    <div v-else>
      <div class="flex flex-col gap-2">
        <UCard v-for="pressItem in rowsFilteredPressReleases" :key="pressItem._path"
          class="cursor-pointer custom-shadow">
          <NuxtLink :to="pressItem._path" class="font-semibold items-center">
            <div>
              <span class="underline">{{ pressItem.title }}</span>
            </div>
            <div class="siteweb-type inline-block px-2 py-1 my-1 text-xs font-medium bg-gray-200 text-gray-800">
              {{ $dateformatWithDayName(pressItem.date) }}
            </div>
          </NuxtLink>
        </UCard>
      </div>

      <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
        <UPagination size="md" v-model="page" :page-count="pageCount" :total="filteredPressReleases.length" />
      </div>
    </div>
  </div>
</template>