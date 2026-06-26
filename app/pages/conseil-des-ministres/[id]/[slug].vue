<script setup lang="ts">
import { useNews } from '~/composables/news/useNews';

const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();
const route = useRoute();

// Utilisation du composable useNews avec l'ID
const { article, loading, error } = useNews({
  id: route.params.id as string,
});

const title = computed(() => {
  if (!article.value) return 'Communiqué Conseil des ministres Sénégal';
  return `${article.value.title} | Conseil des ministres du Sénégal`;
});

const description = computed(() => {
  if (!article.value) return 'Communiqué conseil des ministres du gouvernement du Sénégal';

  // Extraire du contenu HTML pour créer une description
  const htmlContent = article.value.content || article.value.title;
  const textContent = htmlContent
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const truncatedContent =
    textContent.length > 160 ? `${textContent.substring(0, 157)}...` : textContent;

  return truncatedContent || article.value.title;
});

const url = computed(
  () => `${siteUrl}/conseil-des-ministres/${route.params.id}/${route.params.slug}`,
);

const image = computed(() => {
  // URL absolue construite avec siteUrl (capturé en setup) + useCmsImage() (fonction pure) :
  // pas d'appel de composable Nuxt ici, donc lisible sans risque dans le JSON-LD ci-dessous.
  if (article.value?.cover_image) {
    return `${siteUrl}${useCmsImage(article.value.cover_image)}`;
  }
  return `${siteUrl}/images/share-conseil-des-ministres-nomination-full.jpg`;
});

const publishedDate = computed(() =>
  article.value?.date_published ? new Date(article.value.date_published).toISOString() : null,
);

const modifiedDate = computed(() =>
  article.value?.date_updated
    ? new Date(article.value.date_updated).toISOString()
    : publishedDate.value,
);

// SEO dynamique
useSeoMeta({
  title: () => title.value,
  ogTitle: () => title.value,
  description: () => description.value,
  ogDescription: () => description.value,
  ogImage: () => image.value,
  ogImageAlt: () => article.value?.title || 'Conseil des ministres du Sénégal',
  ogUrl: () => url.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => title.value,
  twitterDescription: () => description.value,
  twitterImage: () => image.value,
  keywords: () =>
    [
      ...keywords,
      'Conseil des ministres Sénégal',
      'communiqué conseil des ministres',
      'gouvernement Sénégal',
      'décisions gouvernementales',
      'Bassirou Diomaye Faye',
      'Ousmane Sonko',
      'politique sénégalaise',
      'République du Sénégal',
    ].join(', '),
});

// Schema.org — JSON-LD brut (pattern projet, modèle : documents/[id]/[slug].vue)
const breadcrumbSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Conseil des ministres',
      item: `${siteUrl}/conseil-des-ministres`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: article.value?.title || 'Communiqué',
      item: url.value,
    },
  ],
}));

const articleSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'GovernmentAnnouncement',
  headline: article.value?.title || 'Communiqué du Conseil des ministres',
  description: description.value,
  image: image.value || undefined,
  datePublished: publishedDate.value || undefined,
  dateModified: modifiedDate.value || publishedDate.value || undefined,
  author: {
    '@type': 'GovernmentOrganization',
    name: 'Conseil des ministres du Sénégal',
    url: `${siteUrl}/conseil-des-ministres`,
  },
  publisher: {
    '@type': 'GovernmentOrganization',
    name: 'Conseil des ministres du Sénégal',
    url: `${siteUrl}/conseil-des-ministres`,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/images/logo-senegal.png`,
    },
  },
  articleSection: 'Gouvernement',
  keywords: ['Conseil des ministres', 'Sénégal', 'Gouvernement', 'Communiqué officiel'],
  about: {
    '@type': 'GovernmentOrganization',
    name: 'Conseil des ministres du Sénégal',
    parentOrganization: {
      '@type': 'GovernmentOrganization',
      name: 'République du Sénégal',
    },
  },
  mainEntityOfPage: url.value,
}));

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: () => [
    { rel: 'canonical', href: url.value },
    { rel: 'alternate', hreflang: 'fr-SN', href: url.value },
  ],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: 'Conseil des ministres du Sénégal' },
    { property: 'og:type', content: 'article' },
    { property: 'og:site_name', content: siteName },
    { property: 'article:published_time', content: () => publishedDate.value },
    { property: 'article:modified_time', content: () => modifiedDate.value },
    { property: 'article:section', content: 'Gouvernement' },
    { name: 'robots', content: 'index, follow, max-image-preview:large' },
    { name: 'geo.region', content: 'SN' },
    { name: 'geo.placename', content: 'Dakar' },
    { name: 'geo.position', content: '14.7645042;-17.3660286' },
    { name: 'ICBM', content: '14.7645042, -17.3660286' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify(breadcrumbSchema.value)),
    },
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify(articleSchema.value)),
    },
  ],
});

// Fonction pour obtenir l'URL de l'asset
const getAssetUrl = (assetId: string, slug: string) => {
  return useCmsFile(`${assetId}/${slug}.pdf`);
};

const formatDateISO = (date: string) => {
  return new Date(date).toISOString();
};
</script>

<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-gray-900">
    <!-- Sticky Header (mobile only) -->
    <header
      class="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95 md:relative md:border-0 md:bg-transparent md:backdrop-blur-none dark:md:bg-transparent"
    >
      <div class="container mx-auto px-4">
        <div class="flex items-center gap-3 py-3 md:hidden">
          <!-- Back button -->
          <NuxtLink
            to="/conseil-des-ministres"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 active:scale-95 dark:bg-gray-800 dark:text-gray-400"
            aria-label="Retour"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          </NuxtLink>

          <!-- Title & Meta -->
          <div class="min-w-0 flex-1">
            <h1
              v-if="article"
              class="line-clamp-2 text-xs font-semibold leading-tight text-gray-900 dark:text-white"
            >
              {{ article.title }}
            </h1>
            <USkeleton v-else class="h-4 w-48" />
            <p v-if="article?.date_published" class="mt-0.5 text-[10px] text-gray-500">
              {{ $dateformatWithDayName(article.date_published) }}
            </p>
          </div>

          <!-- Mobile Actions -->
          <div v-if="article?.document" class="flex shrink-0 items-center gap-2 md:hidden">
            <a
              :href="getAssetUrl(article.document.file, article.slug)"
              target="_blank"
              rel="noopener"
              class="flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-medium text-white transition-colors hover:bg-emerald-700 active:scale-95"
            >
              <UIcon name="i-heroicons-arrow-down-tray" class="h-4 w-4" />
              PDF
            </a>
          </div>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-6">
      <AppBreadcrumb
        :items="[
          { label: 'Conseil des ministres', to: '/conseil-des-ministres' },
          { label: article?.title || 'Communiqué' },
        ]"
      />

      <!-- Loading state -->
      <div v-if="loading" class="mx-auto max-w-3xl space-y-6">
        <div
          class="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
        >
          <USkeleton class="aspect-video w-full" />
          <div class="space-y-4 p-6">
            <USkeleton class="h-6 w-3/4" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-2/3" />
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="mx-auto max-w-md py-16 text-center">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
        >
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="h-8 w-8 text-red-600 dark:text-red-400"
          />
        </div>
        <h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          Erreur de chargement
        </h2>
        <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Une erreur est survenue lors du chargement de l'article.
        </p>
        <NuxtLink
          to="/conseil-des-ministres"
          class="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 active:scale-95 dark:bg-white dark:text-gray-900"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          Retour aux communiqués
        </NuxtLink>
      </div>

      <!-- Content -->
      <div v-else-if="article" class="mx-auto max-w-3xl">
        <article itemscope itemtype="https://schema.org/GovernmentAnnouncement">
          <!-- Schema.org hidden metadata -->
          <div
            itemprop="publisher"
            itemscope
            itemtype="https://schema.org/GovernmentOrganization"
            class="hidden"
          >
            <meta itemprop="name" content="Conseil des ministres du Sénégal" />
            <meta itemprop="url" :content="`${siteUrl}/conseil-des-ministres`" />
          </div>
          <div
            itemprop="about"
            itemscope
            itemtype="https://schema.org/GovernmentOrganization"
            class="hidden"
          >
            <meta itemprop="name" content="Conseil des ministres du Sénégal" />
            <div
              itemprop="parentOrganization"
              itemscope
              itemtype="https://schema.org/GovernmentOrganization"
            >
              <meta itemprop="name" content="République du Sénégal" />
            </div>
          </div>
          <meta itemprop="url" :content="url" />
          <meta itemprop="genre" content="Communiqué officiel" />
          <meta itemprop="articleSection" content="Gouvernement" />
          <meta
            itemprop="keywords"
            content="Conseil des ministres, Sénégal, Gouvernement, Communiqué officiel"
          />

          <!-- Cover Image -->
          <div
            v-if="article.cover_image"
            class="mb-6 overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
            itemprop="image"
            itemscope
            itemtype="https://schema.org/ImageObject"
          >
            <CmsImage
              :src="article.cover_image"
              :alt="article.title"
              :quality="100"
              class="aspect-video w-full object-cover"
              itemprop="contentUrl url"
            />
            <meta itemprop="width" content="800" />
            <meta itemprop="height" content="450" />
          </div>

          <!-- Main Content Card -->
          <div class="space-y-6">
            <!-- Title & Meta (visible on larger screens) -->
            <div class="hidden md:block">
              <h1
                class="mb-3 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl"
                itemprop="headline name"
              >
                {{ article.title }}
              </h1>
              <div class="flex items-center gap-3 text-sm text-gray-500">
                <time
                  v-if="article.date_published"
                  :datetime="formatDateISO(article.date_published)"
                  itemprop="datePublished"
                  class="flex items-center gap-1.5"
                >
                  <UIcon name="i-heroicons-calendar" class="h-4 w-4" />
                  {{ $dateformatWithDayName(article.date_published) }}
                </time>
                <meta
                  v-if="article.date_updated"
                  itemprop="dateModified"
                  :content="formatDateISO(article.date_updated)"
                />
              </div>
            </div>

            <!-- PDF Download (desktop) -->
            <div v-if="article.document" class="hidden md:block">
              <a
                :href="getAssetUrl(article.document.file, article.slug)"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 active:scale-[0.98]"
              >
                <UIcon name="i-heroicons-arrow-down-tray" class="h-4 w-4" />
                Télécharger le PDF
              </a>
            </div>

            <!-- Article Body -->
            <div
              class="rounded-2xl bg-white p-6 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700 sm:p-8"
            >
              <div
                itemprop="articleBody"
                class="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-h2:mt-8 prose-h2:text-xl prose-p:leading-relaxed prose-a:text-emerald-600 dark:prose-a:text-emerald-400"
                v-html="article.content"
              ></div>
            </div>

            <!-- Share & Social -->
            <div
              class="rounded-2xl bg-white p-5 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
            >
              <SocialShare :title="article.title" :url="url" />
            </div>
          </div>
        </article>
      </div>

      <!-- Not Found -->
      <div v-else class="mx-auto max-w-md py-16 text-center">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
        >
          <UIcon name="i-heroicons-document-magnifying-glass" class="h-8 w-8 text-gray-400" />
        </div>
        <h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          Communiqué non trouvé
        </h2>
        <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Ce communiqué n'existe pas ou a été supprimé.
        </p>
        <NuxtLink
          to="/conseil-des-ministres"
          class="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 active:scale-95 dark:bg-white dark:text-gray-900"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          Voir tous les communiqués
        </NuxtLink>
      </div>
    </div>

    <ScrollToTopButton />
  </div>
</template>

<style scoped>
:deep(.prose img) {
  @apply mx-auto rounded-xl;
}
</style>
