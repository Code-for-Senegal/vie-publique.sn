<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const documentId = computed(() => route.params.id as string);

const {
  document,
  loading: documentLoading,
  error: documentError,
} = useDocuments({
  id: documentId.value,
});

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await refreshNuxtData(`document-${newId}`);
    }
  },
);

// Mapping des types de documents vers labels et URLs
const documentTypes: Record<string, { label: string; slug: string }> = {
  official_journal: { label: 'Journal Officiel', slug: 'journal-officiel' },
  audit_report: { label: "Rapport d'Audit", slug: 'rapports-audit' },
  budget: { label: 'Budget', slug: 'budget' },
  strategy: { label: 'Stratégie', slug: 'strategies' },
  law: { label: 'Code & Loi', slug: 'codes' },
};

const typeInfo = computed(() => {
  const type = document.value?.type;
  if (type && documentTypes[type as keyof typeof documentTypes]) {
    return documentTypes[type as keyof typeof documentTypes];
  }
  return { label: 'Document', slug: 'public' };
});

const typeLabel = computed(() => typeInfo.value.label);
const typeSlug = computed(() => typeInfo.value.slug);

const getSafeString = (val: unknown): string => {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  return '';
};

const pageTitle = computed(() =>
  document.value?.title
    ? `${getSafeString(document.value.title)} - Vie Publique Sénégal`
    : 'Chargement...',
);

const pageDescription = computed(
  () =>
    getSafeString(document.value?.description) ||
    `${typeLabel.value} - Document officiel du Sénégal`,
);

const { siteUrl } = useSiteMetadata();

const pageImageUrl = computed(() => {
  const img = document.value?.cover_image;
  if (typeof img !== 'string') return '';

  // Utilisation safe : on récupère l'url relative et on concatène avec siteUrl déjà résolu
  const relativeUrl = useCmsImage(img, 80);
  if (relativeUrl.startsWith('http')) return relativeUrl;
  return `${siteUrl}${relativeUrl}`;
});

// SEO dynamique
useSeoMeta({
  title: () => pageTitle.value,
  description: () => pageDescription.value,
  // Open Graph
  ogTitle: () => getSafeString(document.value?.title),
  ogDescription: () => getSafeString(document.value?.description) || typeLabel.value,
  ogImage: () => pageImageUrl.value,
  ogType: 'article',
  ogUrl: () =>
    document.value
      ? `https://vie-publique.sn/documents/${document.value.id}/${document.value.slug}`
      : '',
  // Twitter Cards
  twitterCard: 'summary_large_image',
  twitterTitle: () => getSafeString(document.value?.title),
  twitterDescription: () => getSafeString(document.value?.description) || typeLabel.value,
  twitterImage: () => pageImageUrl.value,
});

const breadcrumbSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Documents',
      item: `${siteUrl}/documents/public`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: typeLabel.value,
      item: `${siteUrl}/documents/${typeSlug.value}`,
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: document.value?.title || '',
      item: document.value
        ? `${siteUrl}/documents/${document.value.id}/${document.value.slug}`
        : '',
    },
  ],
}));

const articleSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: getSafeString(document.value?.title),
  description: getSafeString(document.value?.description) || typeLabel.value,
  image: pageImageUrl.value || undefined,
  datePublished: document.value?.publish_date || undefined,
  author: {
    '@type': 'Organization',
    name: 'République du Sénégal',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Vie Publique Sénégal',
    url: siteUrl,
  },
}));

// SEO dynamique
useHead({
  htmlAttrs: { lang: 'fr-SN' },
  // Open Graph & Meta handled by useSeoMeta above, only adding specific overrides if needed or JSON-LD
  script: [
    {
      type: 'application/ld+json',
      children: computed(() => JSON.stringify(breadcrumbSchema.value)),
    },
    {
      type: 'application/ld+json',
      children: computed(() => JSON.stringify(articleSchema.value)),
    },
  ],
});

// Fonction pour obtenir l'URL de l'asset via le nouveau proxy
const getAssetUrl = (assetId: string, slug: string) => {
  return useCmsFile(`${assetId}/${slug}.pdf`);
};
</script>

<template>
  <div>
    <!-- Bouton retour -->
    <!-- Fil d'Ariane -->
    <nav
      class="mb-6 flex items-center text-sm text-gray-500 dark:text-gray-400"
      aria-label="Breadcrumb"
    >
      <NuxtLink to="/" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
        Accueil
      </NuxtLink>
      <span class="mx-2 text-gray-300 dark:text-gray-600">/</span>
      <NuxtLink
        to="/documents/public"
        class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        Documents
      </NuxtLink>
      <span class="mx-2 text-gray-300 dark:text-gray-600">/</span>
      <NuxtLink
        :to="`/documents/${typeSlug}`"
        class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        {{ typeLabel }}
      </NuxtLink>
      <span class="mx-2 text-gray-300 dark:text-gray-600">/</span>
      <span class="truncate font-medium text-gray-900 dark:text-white" aria-current="page">
        {{ document?.title }}
      </span>
    </nav>

    <!-- Loading state -->
    <div v-if="documentLoading" class="space-y-4">
      <div class="h-8 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      <div class="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      <div class="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
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
    <div v-else-if="document" class="prose prose-sm mx-auto sm:prose dark:prose-invert">
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
          <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Document PDF</h3>
          <PdfViewer
            :source="getAssetUrl(document.file.id, document.slug)"
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
