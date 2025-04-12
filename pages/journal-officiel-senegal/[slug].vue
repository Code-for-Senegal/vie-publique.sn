<!-- [slug].vue -->
<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();
const { journal, loading, error, fetchJournalBySlug } = useJournalOfficial();

const links = [{ label: "Journaux", to: "/journal-officiel-senegal" }];

onMounted(async () => {
  if (route.params.slug) {
    await fetchJournalBySlug(route.params.slug as string);
  }
});

// Configuration SEO dynamique
watchEffect(() => {
  if (journal.value) {
    useHead({
      title: journal.value.document.title,
      meta: [
        { name: "description", content: journal.value.document.description },
        { property: "og:title", content: journal.value.document.title },
        {
          property: "og:description",
          content: journal.value.document.description,
        },
      ],
    });
  }
});

// Fonction pour obtenir l'URL de l'asset
const getAssetUrl = (assetId: string) => {
  return `${config.public.cmsApiUrl}/assets/${assetId}`;
};
</script>

<template>
  <div>
    <AppBreadcrumb :links="links" :last-text="route.params.slug" />

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-8">
      <UProgress color="blue" />
      <p class="mt-4">Chargement des journaux officiels...</p>
    </div>
    <!-- <div v-if="loading" class="space-y-4">
      <div class="h-8 w-3/4 animate-pulse rounded bg-gray-200"></div>
      <div class="h-64 animate-pulse rounded-lg bg-gray-200"></div>
      <div class="h-4 animate-pulse rounded bg-gray-200"></div>
      <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
    </div> -->

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      title="Erreur"
      description="Une erreur s'est produite lors du chargement du journal officiel."
      color="red"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Contenu -->
    <div v-else-if="journal" class="prose prose-sm sm:prose mx-auto">
      <h1>{{ journal.document.title }}</h1>

      <!-- PDF Download link -->
      <div v-if="journal.document.file" class="my-4">
        <a
          :href="getAssetUrl(journal.document.file)"
          target="_blank"
          class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          📄 Télécharger le PDF
        </a>
      </div>

      <!-- Contenu HTML -->
      <div v-html="journal.document.content_html"></div>

      <ClientOnly placeholder="Chargement en cours">
        <embed
          :src="getAssetUrl(journal.document.file)"
          type="application/pdf"
          width="100%"
          height="700px"
        />
      </ClientOnly>
    </div>

    <!-- Not found state -->
    <div v-else class="py-8 text-center text-gray-500">
      Journal officiel non trouvé
    </div>

    <ScrollToTopButton />
  </div>
</template>

<style>
.prose p a {
  color: rgb(37 99 235);
}
</style>
