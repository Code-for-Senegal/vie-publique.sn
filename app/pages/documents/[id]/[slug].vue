<script setup lang="ts">
const route = useRoute();

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

  const relativeUrl = useCmsImage(img, 80);
  if (relativeUrl.startsWith('http')) return relativeUrl;
  return `${siteUrl}${relativeUrl}`;
});

// SEO dynamique
useSeoMeta({
  title: () => pageTitle.value,
  description: () => pageDescription.value,
  ogTitle: () => getSafeString(document.value?.title),
  ogDescription: () => getSafeString(document.value?.description) || typeLabel.value,
  ogImage: () => pageImageUrl.value,
  ogType: 'article',
  ogUrl: () =>
    document.value
      ? `https://vie-publique.sn/documents/${document.value.id}/${document.value.slug}`
      : '',
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

useHead({
  htmlAttrs: { lang: 'fr-SN' },
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

// URL du fichier pour le PDF
const fileUrl = computed(() => {
  if (!document.value?.file?.id) return '';
  return useCmsFile(`${document.value.file.id}/${document.value.slug}.pdf`);
});

// Taille du fichier formatée
const fileSize = computed(() => {
  if (!document.value?.file?.filesize) return null;
  const bytes = parseInt(document.value.file.filesize);
  if (isNaN(bytes)) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
});

// Date formatée
const formattedDate = computed(() => {
  if (!document.value?.publish_date) return '';
  const date = new Date(document.value.publish_date);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// État du viewer PDF modal
const showPdfViewer = ref(false);
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <div class="container mx-auto px-4">
      <AppBreadcrumb
        :items="[
          { label: 'Documents', to: '/documents' },
          { label: typeLabel, to: `/documents/${typeSlug}` },
          { label: document?.title || 'Document' },
        ]"
      />
    </div>

    <!-- Loading state -->
    <div v-if="documentLoading" class="container mx-auto px-4">
      <div class="space-y-4 py-6">
        <USkeleton class="h-6 w-24 rounded-full" />
        <USkeleton class="h-8 w-3/4" />
        <USkeleton class="h-4 w-1/3" />
        <div class="mt-6 grid gap-4 lg:grid-cols-3">
          <div class="space-y-4 lg:col-span-2">
            <USkeleton class="mx-auto h-64 w-full max-w-md rounded-xl" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-4/5" />
            <USkeleton class="h-4 w-3/5" />
          </div>
          <div class="hidden lg:block">
            <USkeleton class="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="documentError"
      class="container mx-auto flex flex-col items-center justify-center px-4 py-16 text-center"
    >
      <div
        class="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
      >
        <UIcon name="i-heroicons-exclamation-triangle" class="h-8 w-8 text-red-500" />
      </div>
      <p class="mt-4 text-sm font-medium text-gray-900 dark:text-white">Erreur de chargement</p>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Impossible de charger ce document
      </p>
      <NuxtLink
        to="/documents"
        class="mt-4 rounded-full bg-primary-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-600 active:scale-95"
      >
        Retour aux documents
      </NuxtLink>
    </div>

    <!-- Contenu -->
    <article v-else-if="document">
      <!-- Header sticky avec titre et actions -->
      <header
        class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95"
      >
        <div class="container mx-auto px-4 py-4">

          <!-- Titre -->
          <h1
            class="mt-2 line-clamp-2 text-lg font-bold text-gray-900 sm:text-xl lg:line-clamp-none dark:text-white"
          >
            {{ document.title }}
          </h1>

          <!-- Métadonnées -->
          <div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span v-if="formattedDate" class="flex items-center gap-1">
              <UIcon name="i-heroicons-calendar" class="h-3.5 w-3.5" />
              {{ formattedDate }}
            </span>
            <span v-if="document.audit_institution" class="flex items-center gap-1">
              <UIcon name="i-heroicons-building-office" class="h-3.5 w-3.5" />
              {{ document.audit_institution }}
            </span>
            <span v-if="fileSize" class="flex items-center gap-1">
              <UIcon name="i-heroicons-document" class="h-3.5 w-3.5" />
              PDF · {{ fileSize }}
            </span>
          </div>

          <!-- Actions Mobile -->
          <div v-if="document.file" class="mt-3 flex items-center gap-2 lg:hidden">
            <button
              type="button"
              class="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-600 active:scale-[0.98]"
              @click="showPdfViewer = true"
            >
              <UIcon name="i-heroicons-eye" class="h-4 w-4" />
              Lire
            </button>
            <a
              :href="fileUrl"
              target="_blank"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 active:scale-95 dark:bg-gray-800 dark:text-gray-400"
            >
              <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-5 w-5" />
            </a>
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 active:scale-95 dark:bg-gray-800 dark:text-gray-400"
              @click="
                downloadCmsFile(
                  `${document!.file!.id}/${document!.slug}.pdf`,
                  `${document!.slug}.pdf`,
                )
              "
            >
              <UIcon name="i-heroicons-arrow-down-tray" class="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container mx-auto px-4 py-6">
        <!-- Partage social Mobile -->
        <div class="mb-6 lg:hidden">
          <SocialShare :title="document.title" />
        </div>

        <div class="grid gap-8 lg:grid-cols-3">
          <!-- Colonne principale -->
          <div class="lg:col-span-2">
            <!-- Image de couverture -->
            <div v-if="document.cover_image" class="mb-6">
              <div class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
                <CmsImage
                  :src="document.cover_image"
                  :alt="document.title"
                  :quality="80"
                  class="mx-auto w-full max-w-lg object-contain"
                />
              </div>
            </div>

            <!-- Description -->
            <div
              v-if="document.description"
              class="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
            >
              <p class="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {{ document.description }}
              </p>
            </div>

            <!-- Contenu HTML -->
            <div
              v-if="document.content_html"
              class="prose prose-sm prose-gray max-w-none rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:p-6 dark:prose-invert dark:bg-gray-800 dark:ring-gray-700"
              v-html="document.content_html"
            />

            <!-- Aperçu PDF intégré -->
            <ClientOnly>
              <div v-if="fileUrl" class="mt-8">
                <div class="mb-4 flex items-center gap-2">
                  <UIcon name="i-heroicons-document-text" class="h-5 w-5 text-gray-400" />
                  <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
                    Aperçu du document
                  </h2>
                </div>
                <div
                  class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
                >
                  <PdfViewer
                    :source="fileUrl"
                    :download-name="`${document?.slug || 'document'}.pdf`"
                  />
                </div>
              </div>
            </ClientOnly>
          </div>

          <!-- Sidebar Desktop -->
          <aside class="hidden lg:col-span-1 lg:block">
            <div class="sticky top-32 space-y-4">
              <!-- Bloc fichier -->
              <div
                v-if="document.file"
                class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
              >
                <div class="mb-4 flex items-center gap-3">
                  <div
                    class="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/30"
                  >
                    <UIcon
                      name="i-heroicons-document-text"
                      class="h-5 w-5 text-red-500"
                    />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">Document PDF</p>
                    <p v-if="fileSize" class="text-xs text-gray-500 dark:text-gray-400">
                      {{ fileSize }}
                    </p>
                  </div>
                </div>

                <div class="space-y-2">
                  <button
                    type="button"
                    class="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 transition-all hover:bg-gray-100 active:scale-[0.98]"
                    @click="showPdfViewer = true"
                  >
                    <UIcon name="i-heroicons-eye" class="h-4 w-4" />
                    Lire le PDF
                  </button>
                  <div class="grid grid-cols-2 gap-2">
                    <a
                      :href="fileUrl"
                      target="_blank"
                      class="flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition-all hover:bg-gray-200 active:scale-[0.98] dark:bg-gray-800 dark:text-gray-300"
                    >
                      <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-3.5 w-3.5" />
                      Ouvrir
                    </a>
                    <button
                      type="button"
                      class="flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition-all hover:bg-gray-200 active:scale-[0.98] dark:bg-gray-800 dark:text-gray-300"
                      @click="
                        downloadCmsFile(
                          `${document!.file!.id}/${document!.slug}.pdf`,
                          `${document!.slug}.pdf`,
                        )
                      "
                    >
                      <UIcon name="i-heroicons-arrow-down-tray" class="h-3.5 w-3.5" />
                      Télécharger
                    </button>
                  </div>
                </div>
              </div>

              <!-- Message si pas de fichier -->
              <div
                v-else
                class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
              >
                <div class="flex items-center gap-3 text-gray-400">
                  <UIcon name="i-heroicons-document" class="h-5 w-5" />
                  <p class="text-sm">Aucun fichier disponible</p>
                </div>
              </div>

              <!-- Partage social -->
              <div
                class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
              >
                <p class="mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">Partager</p>
                <SocialShare :title="document.title" />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </article>

    <!-- Not found state -->
    <div
      v-else
      class="container mx-auto flex flex-col items-center justify-center px-4 py-16 text-center"
    >
      <div
        class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
      >
        <UIcon name="i-heroicons-document-magnifying-glass" class="h-8 w-8 text-gray-400" />
      </div>
      <p class="mt-4 text-sm font-medium text-gray-900 dark:text-white">Document introuvable</p>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Ce document n'existe pas ou a été supprimé
      </p>
      <NuxtLink
        to="/documents"
        class="mt-4 rounded-full bg-primary-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-600 active:scale-95"
      >
        Voir tous les documents
      </NuxtLink>
    </div>

    <!-- Visionneuse PDF Modal -->
    <ClientOnly>
      <PdfViewerModal
        v-if="showPdfViewer && fileUrl"
        :src="fileUrl"
        :title="document?.title || 'Document PDF'"
        @close="showPdfViewer = false"
      />
    </ClientOnly>

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
