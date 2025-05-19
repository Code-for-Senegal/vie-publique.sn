<!-- pages/conseil-des-ministres/[slug].vue -->
<script setup lang="ts">
import { useNews } from "~/composables/news/useNews";
const config = useRuntimeConfig();

const route = useRoute();
const { article, loading, error, fetchNewsById } = useNews({
  category: "conseil-des-ministres",
});

onMounted(async () => {
  if (route.params.id) {
    await fetchNewsById(route.params.id as string);
  }
});

// SEO dynamique basé sur l'article
const seoTitle = computed(() =>
  article.value
    ? article.value.title
    : "Communiqué Conseil des ministres Sénégal",
);
const seoDescription = computed(() =>
  article.value
    ? article.value.title
    : "Communiqué conseil des ministres du gouvernement du Sénégal",
);
const seoImgPath = computed(
  () =>
    article.value?.cover_image ||
    "/images/share-conseil-des-ministres-nomination-full.jfif",
);
const seoPageUrl = computed(
  () => `https://vie-publique.sn/conseil-des-ministres/${route.params.slug}`,
);

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
    { property: "og:type", content: "article" },
  ],
});

const links = [{ label: "communiqués", to: "/conseil-des-ministres" }];

// Fonction pour obtenir l'URL de l'asset
const getAssetUrl = (assetId: string, slug: string) => {
  return `${config.public.cmsApiUrl}/assets/${assetId}/${slug}.pdf`;
};
</script>

<template>
  <div>
    <AppBreadcrumb :links="links" :last-text="route.params.slug" />

    <!-- Loading state -->
    <div v-if="loading" class="space-y-4">
      <div class="h-8 w-3/4 animate-pulse rounded bg-gray-200"></div>
      <div class="h-64 animate-pulse rounded-lg bg-gray-200"></div>
      <div class="h-4 animate-pulse rounded bg-gray-200"></div>
      <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
    </div>

    <div v-else-if="error" class="py-4 text-center text-red-500">
      {{ error }}
    </div>

    <template v-else-if="article">
      <div
        class="prose prose-sm sm:prose dark:prose-invert dark:prose-a:text-blue-400 mx-auto"
      >
        <h1 class="dark:text-white">{{ article.title }}</h1>

        <div class="text-sm text-gray-600 dark:text-gray-400">
          {{ $dateformatWithDayName(article.date_published) }}
        </div>

        <img
          v-if="article.cover_image"
          :src="$directusImageUrl(article.cover_image, '100')"
          :alt="article.title"
          class="w-full object-cover"
        />

        <!-- Lien PDF si disponible -->
        <div v-if="article.document" class="my-4">
          <a
            :href="getAssetUrl(article.document.file, article.slug)"
            target="_blank"
            class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-blue-800"
          >
            📥 Télécharger le PDF
          </a>
        </div>

        <!-- Contenu HTML -->
        <div v-html="article.content"></div>
      </div>
    </template>

    <div v-else class="py-4 text-center">Article non trouvé</div>

    <ScrollToTopButton />
  </div>
</template>

<style scoped>
:deep(.prose img) {
  @apply mx-auto;
}
</style>
