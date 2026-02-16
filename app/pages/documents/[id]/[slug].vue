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
  <div class="py-6 md:py-8">
    <!-- Loading state -->
    <div v-if="documentLoading" class="animate-pulse space-y-4">
      <div class="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700" />
      <div class="h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      <div class="h-64 rounded-lg bg-gray-200 dark:bg-gray-700" />
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
    <article v-else-if="document">
      <!-- Fil d'Ariane -->
      <nav class="mb-4 text-sm text-gray-500 dark:text-gray-400">
        <NuxtLink to="/" class="transition-colors hover:text-primary-600 dark:hover:text-primary-400">
          Accueil
        </NuxtLink>
        <span class="mx-2">/</span>
        <NuxtLink
          to="/documents/public"
          class="transition-colors hover:text-primary-600 dark:hover:text-primary-400"
        >
          Documents
        </NuxtLink>
        <span class="mx-2">/</span>
        <NuxtLink
          :to="`/documents/${typeSlug}`"
          class="transition-colors hover:text-primary-600 dark:hover:text-primary-400"
        >
          {{ typeLabel }}
        </NuxtLink>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">{{ document.title }}</span>
      </nav>

      <!-- Titre -->
      <h1 class="mb-4 text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
        {{ document.title }}
      </h1>

      <!-- Bloc fichier mobile (prioritaire) -->
      <div
        v-if="document.file"
        class="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:hidden dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="mb-3 flex items-center gap-2">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/30"
          >
            <UIcon name="i-heroicons-document-text" class="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
            PDF{{ fileSize ? ` - ${fileSize}` : '' }}
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <UButton
            @click="showPdfViewer = true"
            icon="i-heroicons-eye"
            label="Lire le PDF"
            color="yellow"
            block
          />
          <div class="grid grid-cols-2 gap-2">
            <UButton
              :to="fileUrl"
              external
              target="_blank"
              icon="i-heroicons-arrow-top-right-on-square"
              label="Ouvrir"
              color="gray"
              variant="outline"
              size="sm"
            />
            <UButton
              @click="downloadCmsFile(`${document!.file!.id}/${document!.slug}.pdf`, `${document!.slug}.pdf`)"
              icon="i-heroicons-arrow-down-tray"
              label="Télécharger"
              color="gray"
              variant="outline"
              size="sm"
            />
          </div>
        </div>
      </div>

      <!-- Partage social (Mobile) -->
      <div class="mb-8 lg:hidden">
        <SocialShare :title="document.title" />
      </div>

      <div class="grid gap-8 lg:grid-cols-3">
        <!-- Colonne principale -->
        <div class="lg:col-span-2">
          <!-- Image de couverture -->
          <div v-if="document.cover_image" class="mb-6">
            <CmsImage
              :src="document.cover_image"
              :alt="document.title"
              :quality="80"
              class="mx-auto max-w-md rounded-lg shadow-md md:max-w-lg"
            />
          </div>

          <!-- Institution d'audit -->
          <div v-if="document.audit_institution" class="mb-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Institution :
              <span class="font-medium text-gray-700 dark:text-gray-300">{{
                document.audit_institution
              }}</span>
            </p>
          </div>

          <!-- Description -->
          <div v-if="document.description" class="mb-6">
            <p class="text-gray-700 dark:text-gray-300">
              {{ document.description }}
            </p>
          </div>

          <!-- Contenu HTML -->
          <div
            v-if="document.content_html"
            class="prose prose-gray max-w-none dark:prose-invert"
            v-html="document.content_html"
          />

          <!-- Aperçu PDF intégré -->
          <ClientOnly>
            <div v-if="fileUrl" class="mt-8">
              <div class="mb-4 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Aperçu du document
                </h2>
                <UButton
                  @click="showPdfViewer = true"
                  icon="i-heroicons-arrows-pointing-out"
                  label="Plein écran"
                  color="yellow"
                  variant="outline"
                  size="sm"
                />
              </div>
              <div class="overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
                <PdfViewer
                  :source="fileUrl"
                  :download-name="`${document?.slug || 'document'}.pdf`"
                />
              </div>
            </div>
          </ClientOnly>
        </div>

        <!-- Sidebar (desktop uniquement) -->
        <aside class="hidden space-y-6 lg:col-span-1 lg:block">
          <!-- Bloc fichier -->
          <div
            v-if="document.file"
            class="sticky top-24 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <h2 class="mb-4 font-semibold text-gray-900 dark:text-white">Télécharger le document</h2>

            <div class="mb-4 flex items-center gap-3">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/30"
              >
                <UIcon
                  name="i-heroicons-document-text"
                  class="h-6 w-6 text-red-600 dark:text-red-400"
                />
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  PDF{{ fileSize ? ` - ${fileSize}` : '' }}
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <UButton
                @click="showPdfViewer = true"
                icon="i-heroicons-eye"
                label="Lire le PDF"
                color="yellow"
                block
              />
              <UButton
                :to="fileUrl"
                external
                target="_blank"
                icon="i-heroicons-arrow-top-right-on-square"
                label="Ouvrir"
                color="gray"
                variant="outline"
                block
              />
              <UButton
                @click="downloadCmsFile(`${document!.file!.id}/${document!.slug}.pdf`, `${document!.slug}.pdf`)"
                icon="i-heroicons-arrow-down-tray"
                label="Télécharger"
                color="gray"
                variant="outline"
                block
              />
            </div>

            <!-- Partage social -->
            <div class="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
              <SocialShare :title="document.title" />
            </div>
          </div>

          <!-- Message si pas de fichier -->
          <div
            v-else
            class="sticky top-24 space-y-6"
          >
            <div
              class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Aucun fichier disponible pour ce document.
              </p>
            </div>

            <!-- Partage social même sans fichier -->
            <div
              class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <SocialShare :title="document.title" />
            </div>
          </div>
        </aside>
      </div>
    </article>

    <!-- Not found state -->
    <div v-else class="py-8 text-center text-gray-500 dark:text-gray-400">Document non trouvé</div>

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
