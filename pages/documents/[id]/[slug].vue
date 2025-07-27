<!-- [slug].vue -->
<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();
const { document, loading, error, fetchDocumentById } = useDocuments();
const router = useRouter();

onMounted(async () => {
  if (route.params.id) {
    console.log(route.params.id);
    await fetchDocumentById(route.params.id as string);
  }
});

// Configuration SEO dynamique
watchEffect(() => {
  if (document.value) {
    useHead({
      title: document.value.title,
      link: [
        {
          rel: "canonical",
          href: `https://vie-publique.sn/documents/${document.value.id}/${document.value.slug}`,
        },
      ],
      meta: [
        { name: "description", content: document.value.description },
        { property: "og:title", content: document.value.title },
        {
          property: "og:description",
          content: document.value.description,
        },
      ],
    });
  }
});

// Fonction pour obtenir l'URL de l'asset
const getAssetUrl = (assetId: string, slug: string) => {
  return `${config.public.cmsApiUrl}/assets/${assetId}/${slug}.pdf`;
};
</script>

<template>
  <div>
    <!-- Bouton retour -->
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      label="Retour à la liste"
      color="gray"
      @click.native="router.back()"
    />

    <!-- Loading state -->
    <div v-if="loading" class="space-y-4">
      <div class="h-8 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      <div class="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      <div class="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      title="Erreur"
      description="Une erreur s'est produite lors du chargement du document officiel."
      color="red"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Contenu -->
    <div v-else-if="document" class="prose prose-sm sm:prose mx-2 mx-auto dark:prose-invert">
      <div class="">
        <h1>{{ document.title }}</h1>
      </div>
      <!-- PDF Download link -->
      <div v-if="document.file" class="my-4">
        <a
          :href="getAssetUrl(document.file, document.slug)"
          target="_blank"
          class="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          📥 Télécharger le PDF
        </a>
      </div>

      <!-- Contenu HTML -->
      <div v-html="document.content_html"></div>

      <ClientOnly v-if="document.file" placeholder="Chargement en cours">
        <div class="mt-8">
          <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Document PDF</h3>
          <PdfViewerPdfjs 
            :source="getAssetUrl(document.file, document.slug)"
            :download-name="`${document.slug}.pdf`"
          />
        </div>
      </ClientOnly>
    </div>

    <!-- Not found state -->
    <div v-else class="py-8 text-center text-gray-500 dark:text-gray-400">Document non trouvé</div>

    <ScrollToTopButton />
  </div>
</template>

<style>
.prose p a {
  @apply text-blue-600 dark:text-blue-400;
}

.dark .prose p a {
  @apply hover:text-blue-300;
}
</style>
