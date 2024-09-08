<script setup lang="ts">
/* SEO */
const seoTitle = "Annuaire sites web du Sénégal";
const seoDescription = "Annuaire de sites internets publics du Sénégal";
const seoImgPath = "https://vie-publique.sn/images/share-linkedin.png";
const seoPageUrl = "https://www.vie-publique.sn/annuaire-sites-publics-senegal";
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

/* Get Datas */

const nuxtApp = useNuxtApp();
const { data, error } = await useFetch("/api/websites", {
  watch: false,

  transform(input) {
    return {
      sites: input,
      fetchedAt: new Date(),
    };
  },

  getCachedData(key) {
    const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    if (!data) {
      return;
    }
    const expirationDate = new Date(data.fetchedAt);
    expirationDate.setTime(expirationDate.getTime() + 120 * 1000); // 120 secondes
    const isExpired = expirationDate.getTime() < Date.now();
    if (isExpired) {
      return;
    }

    return data;
  },
});

if (error.value) {
  console.error("Failed to fetch websites data:", error.value);
}

/* Filters */

const searchQuery = ref("");
const selectedType = ref("");

const filteredSites = computed(() => {
  return data.value.sites.filter(
    (site: any) =>
      (site.nom.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        site.url.toLowerCase().includes(searchQuery.value.toLowerCase())) &&
      (selectedType.value ? site.type === selectedType.value : true),
  );
});

const types = computed(() => {
  const allTypes = data.value.sites.map((site: any) => site.type.trim());
  return Array.from(new Set(allTypes));
});

/* Pagination */

const page = ref(1);
const pageCount = 20;

const rowsFilteredSites = computed(() => {
  return filteredSites.value.slice(
    (page.value - 1) * pageCount,
    page.value * pageCount,
  );
});

// Réinitialiser la page lors du changement de type
watch(selectedType, () => {
  page.value = 1;
});
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Annuaire sites internets</h1>
    </div>
    <p class="mb-4 text-center text-sm text-gray-500">
      Liste non exhaustive de {{ data.sites.length }} site web publics du
      Sénégal
    </p>

    <div class="w-full max-w-4xl">
      <UInput
        v-model="searchQuery"
        class="input custom-shadow mb-3 w-full sm:w-full"
        size="lg"
        icon="i-heroicons-magnifying-glass"
        placeholder="Rechercher un site..."
      />

      <USelect
        v-model="selectedType"
        class="custom-shadow mb-3 w-full sm:w-full"
        size="lg"
        icon="i-heroicons-funnel"
        placeholder="Filtrer par type"
        :options="types"
      />

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UCard
          v-for="site in rowsFilteredSites"
          :key="site.url"
          class="custom-shadow cursor-pointer"
        >
          <ULink
            :to="site.url"
            target="_blank"
            class="text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            {{ site.url }}
          </ULink>
          <div>
            <p class="text-sm">{{ site.nom }}</p>
            <span
              class="siteweb-type my-1 inline-block bg-gray-200 px-2 py-1 text-xs font-medium text-gray-800"
            >
              {{ site.type }}
            </span>
          </div>
        </UCard>
      </div>

      <div
        class="flex justify-end border-t border-gray-200 px-3 py-3.5 dark:border-gray-700"
      >
        <UPagination
          v-model="page"
          size="md"
          :page-count="pageCount"
          :total="filteredSites.length"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
