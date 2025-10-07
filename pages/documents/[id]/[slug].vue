<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const collection = useCollection();

const {
  data: documentData,
  pending: documentLoading,
  error: documentError,
} = useAsyncData(`document-${route.params.id}`, async () => {
  if (route.params.id) {
    const document = await collection.fetchDocumentById(
      route.params.id as string,
    );
    return { document };
  }
  return { document: null };
});

const document = computed(() => documentData.value?.document || null);

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await refreshNuxtData(`document-${newId}`);
    }
  },
);

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
        {
          name: "description",
          content: document.value.description || document.value.title,
        },
        { property: "og:title", content: document.value.title },
        {
          property: "og:description",
          content: document.value.description || document.value.title,
        },
        {
          property: "og:image",
          content:
            document.value.cover_image ||
            "https://vie-publique.sn/images/vpsn-share-jors.png",
        },
        { property: "og:type", content: "article" },
        {
          property: "og:url",
          content: `https://vie-publique.sn/documents/${document.value.id}/${document.value.slug}`,
        },
      ],
    });

    // Données structurées pour le document
    useSchemaOrg([
      {
        "@type": "Document",
        name: document.value.title,
        description: document.value.description || document.value.title,
        datePublished: document.value.publish_date,
        ...(document.value.cover_image && {
          image: document.value.cover_image,
        }),
      },
    ]);
  }
});

// Fonction pour obtenir l'URL de l'asset via le nouveau proxy
const getAssetUrl = (assetId: string, slug: string) => {
  return useCmsFile(`${assetId}/${slug}.pdf`);
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
      @click="router.back()"
    />

    <!-- Loading state -->
    <div v-if="documentLoading" class="space-y-4">
      <div
        class="h-8 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
      ></div>
      <div
        class="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
      ></div>
      <div class="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      <div
        class="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
      ></div>
    </div>

    <!-- Error state -->
    <UAlert
      v-else-if="documentError"
      title="Erreur"
      description="Une erreur s'est produite lors du chargement du document."
      color="red"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Contenu -->
    <div
      v-else-if="document"
      class="prose prose-sm sm:prose dark:prose-invert mx-auto"
    >
      <div class="">
        <h1>{{ document.title }}</h1>
      </div>

      <!-- PDF Download link -->
      <div v-if="document.file && document.content_html" class="my-4">
        <a
          :href="getAssetUrl(document.file.id, document.slug)"
          target="_blank"
          class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          📥 Télécharger le PDF
        </a>
      </div>

      <!-- Contenu HTML -->
      <div v-if="document.content_html" v-html="document.content_html"></div>

      <!-- PDF Viewer -->
      <ClientOnly v-if="document.file" placeholder="Chargement en cours">
        <div class="not-prose mt-8">
          <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            Document PDF
          </h3>
          <PdfViewer
            :source="getAssetUrl(document.file.id, document.slug)"
            :download-name="`${document.slug}.pdf`"
          />
        </div>
      </ClientOnly>
    </div>

    <!-- Not found state -->
    <div v-else class="py-8 text-center text-gray-500 dark:text-gray-400">
      Document non trouvé
    </div>

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
