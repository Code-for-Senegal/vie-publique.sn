<script setup lang="ts">
import { useNews } from '~/composables/news/useNews';

const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const route = useRoute();
const config = useRuntimeConfig();

// Utilisation de useNews avec l'ID
const { article, loading, error, refresh } = useNews({
  id: route.params.id as string,
});

// Recharger l'article si l'ID change
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      refresh();
    }
  },
);

const title = computed(() => {
  if (!article.value) return 'Chargement...';
  return `${article.value.title} | Actualités Sénégal`;
});

const description = computed(() => {
  if (!article.value) return '';
  const plainText = article.value.content?.replace(/<[^>]*>/g, '') || article.value.title;
  const excerpt = plainText.length > 160 ? plainText.substring(0, 157) + '...' : plainText;
  return `${excerpt} Publié le ${formatDate(article.value.date_published)} - Actualités République du Sénégal.`;
});

const url = computed(() => {
  if (!route.params.id || !route.params.slug) return siteUrl;
  return `${siteUrl}/actualites/${route.params.id}/${route.params.slug}`;
});

const image = computed(() => {
  if (!article.value) return defaultImage;
  return article.value.cover_image ? useCmsImageAbsolute(article.value.cover_image) : defaultImage;
});

const pdfUrl = computed(() => {
  if (!article.value?.document?.file) return '';
  return useCmsFile(article.value.document.file);
});

const articleSchema = computed(() => {
  if (!article.value) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.value.title,
    description: description.value,
    image: {
      '@type': 'ImageObject',
      url: image.value,
      width: 800,
      height: 450,
    },
    url: url.value,
    datePublished: formatDateISO(article.value.date_published),
    dateModified: article.value.date_updated
      ? formatDateISO(article.value.date_updated)
      : formatDateISO(article.value.date_published),
    author: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: siteName,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: defaultImage,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url.value,
    },
    articleSection: article.value.category?.name || 'Actualités',
    keywords: article.value.tags?.join(', ') || 'République du Sénégal, actualités',
    about: {
      '@type': 'GovernmentOrganization',
      name: 'République du Sénégal',
    },
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
    },
    inLanguage: 'fr-SN',
  };
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
      name: 'Actualités',
      item: `${siteUrl}/actualites`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: article.value?.title || 'Article',
      item: url.value,
    },
  ],
}));

const webPageSchema = computed(() => {
  if (!article.value) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title.value,
    description: description.value,
    url: url.value,
    image: image.value,
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
    },
    about: {
      '@type': 'GovernmentOrganization',
      name: 'République du Sénégal',
    },
    mainEntity: articleSchema.value,
  };
});

const digitalDocumentSchema = computed(() => {
  if (!article.value?.document?.file) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'DigitalDocument',
    name: `${article.value.title} - PDF`,
    description: `Version PDF de l'article: ${article.value.title}`,
    url: pdfUrl.value,
    encodingFormat: 'application/pdf',
    datePublished: formatDateISO(article.value.date_published),
    inLanguage: 'fr-SN',
    isAccessibleForFree: true,
    creator: {
      '@type': 'Organization',
      name: siteName,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
    },
  };
});

// Helper functions
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatDateISO = (date: string) => {
  return new Date(date).toISOString();
};

// SEO setup
watch(
  [article, route],
  () => {
    if (article.value) {
      // SEO Meta Tags
      useSeoMeta({
        title: title.value,
        ogTitle: title.value,
        description: description.value,
        ogDescription: description.value,
        ogImage: image.value,
        ogUrl: url.value,
        twitterCard: 'summary_large_image',
        twitterTitle: title.value,
        twitterDescription: description.value,
        twitterImage: image.value,
        keywords: [
          ...keywords,
          ...(article.value.tags || []),
          'actualités République Sénégal',
          'news Sénégal',
          article.value.category?.name || '',
        ]
          .filter(Boolean)
          .join(', '),
      });

      // Head Configuration
      useHead({
        htmlAttrs: { lang: 'fr-SN' },
        link: [
          { rel: 'canonical', href: url.value },
          article.value.document?.file
            ? {
                rel: 'alternate',
                type: 'application/pdf',
                href: pdfUrl.value,
              }
            : null,
        ].filter(Boolean),
        meta: [
          { name: 'theme-color', content: themeColor },
          { name: 'author', content: siteName },
          { property: 'og:type', content: 'article' },
          { property: 'og:site_name', content: siteName },
          {
            property: 'article:published_time',
            content: formatDateISO(article.value.date_published),
          },
          {
            property: 'article:modified_time',
            content: article.value.date_updated
              ? formatDateISO(article.value.date_updated)
              : formatDateISO(article.value.date_published),
          },
          { property: 'article:author', content: siteName },
          {
            property: 'article:section',
            content: article.value.category?.name || 'Actualités',
          },
          {
            property: 'article:tag',
            content: article.value.tags?.join(', ') || '',
          },
          { name: 'robots', content: 'index, follow' },
          { name: 'geo.region', content: 'SN' },
          { name: 'geo.placename', content: 'Dakar' },
          { name: 'geo.position', content: '14.7645042;-17.3660286' },
          { name: 'ICBM', content: '14.7645042, -17.3660286' },
          {
            name: 'news_keywords',
            content: article.value.tags?.join(', ') || 'République du Sénégal',
          },
        ],
        script: [
          articleSchema.value
            ? {
                type: 'application/ld+json',
                children: JSON.stringify(articleSchema.value),
              }
            : null,
          {
            type: 'application/ld+json',
            children: JSON.stringify(breadcrumbSchema.value),
          },
          webPageSchema.value
            ? {
                type: 'application/ld+json',
                children: JSON.stringify(webPageSchema.value),
              }
            : null,
          digitalDocumentSchema.value
            ? {
                type: 'application/ld+json',
                children: JSON.stringify(digitalDocumentSchema.value),
              }
            : null,
        ].filter(Boolean),
      });
    }
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-gray-900" itemscope itemtype="https://schema.org/WebPage">
    <!-- Sticky Header (mobile only) -->
    <header class="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95 md:relative md:border-0 md:bg-transparent md:backdrop-blur-none dark:md:bg-transparent">
      <div class="container mx-auto px-4">
        <div class="flex items-center gap-3 py-3 md:hidden">
          <!-- Back button -->
          <NuxtLink
            to="/actualites"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 active:scale-95 dark:bg-gray-800 dark:text-gray-400"
            aria-label="Retour"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          </NuxtLink>

          <!-- Title & Meta -->
          <div class="min-w-0 flex-1">
            <h1 v-if="article" class="line-clamp-2 text-xs font-semibold leading-tight text-gray-900 dark:text-white">
              {{ article.title }}
            </h1>
            <USkeleton v-else class="h-4 w-48" />
            <p v-if="article?.date_published" class="mt-0.5 text-[10px] text-gray-500">
              {{ formatDate(article.date_published) }}
            </p>
          </div>

          <!-- Mobile Actions -->
          <div v-if="article?.document" class="flex shrink-0 items-center gap-2">
            <a
              :href="pdfUrl"
              target="_blank"
              rel="noopener"
              class="flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-medium text-white transition-colors hover:bg-blue-700 active:scale-95"
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
          { label: 'Actualités', to: '/actualites' },
          { label: article?.title || 'Article' },
        ]"
      />

      <!-- Loading state -->
      <div v-if="loading" class="mx-auto max-w-3xl space-y-6">
        <div class="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
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
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <UIcon name="i-heroicons-exclamation-triangle" class="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Erreur de chargement</h2>
        <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Une erreur est survenue lors du chargement de l'article.
        </p>
        <NuxtLink
          to="/actualites"
          class="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 active:scale-95 dark:bg-white dark:text-gray-900"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          Retour aux actualités
        </NuxtLink>
      </div>

      <!-- Content -->
      <article
        v-else-if="article"
        class="mx-auto max-w-3xl"
        itemscope
        itemtype="https://schema.org/NewsArticle"
        itemprop="mainEntity"
      >
        <!-- Schema.org hidden metadata -->
        <div class="hidden">
          <meta itemprop="url" :content="url" />
          <meta itemprop="datePublished" :content="formatDateISO(article.date_published)" />
          <meta itemprop="dateModified" :content="article.date_updated ? formatDateISO(article.date_updated) : formatDateISO(article.date_published)" />
          <meta itemprop="articleSection" :content="article.category?.name || 'Actualités'" />
          <meta itemprop="keywords" :content="article.tags?.join(', ') || 'République du Sénégal'" />
          <meta itemprop="inLanguage" content="fr-SN" />
          <div itemprop="publisher" itemscope itemtype="https://schema.org/NewsMediaOrganization">
            <meta itemprop="name" :content="siteName" />
            <meta itemprop="url" :content="siteUrl" />
            <div itemprop="logo" itemscope itemtype="https://schema.org/ImageObject">
              <meta itemprop="url" :content="defaultImage" />
            </div>
          </div>
          <div itemprop="author" itemscope itemtype="https://schema.org/Organization">
            <meta itemprop="name" :content="siteName" />
            <meta itemprop="url" :content="siteUrl" />
          </div>
          <div itemprop="mainEntityOfPage" itemscope itemtype="https://schema.org/WebPage">
            <meta itemprop="@id" :content="url" />
          </div>
          <div itemprop="about" itemscope itemtype="https://schema.org/GovernmentOrganization">
            <meta itemprop="name" content="République du Sénégal" />
          </div>
        </div>

        <!-- Cover Image -->
        <figure
          v-if="article.cover_image"
          class="mb-6 overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
          itemprop="image"
          itemscope
          itemtype="https://schema.org/ImageObject"
        >
          <CmsImage
            :src="article.cover_image"
            :alt="article.title"
            class="aspect-video w-full object-cover"
            itemprop="contentUrl"
          />
          <meta itemprop="url" :content="useCmsImageAbsolute(article.cover_image)" />
          <meta itemprop="width" content="800" />
          <meta itemprop="height" content="450" />
          <meta itemprop="caption" :content="article.title" />
        </figure>

        <!-- Main Content -->
        <div class="space-y-6">
          <!-- Title & Meta (visible on larger screens) -->
          <div class="hidden md:block">
            <div class="mb-3 flex items-center gap-2">
              <span v-if="article.category?.name" class="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {{ article.category.name }}
              </span>
            </div>
            <h1 class="mb-3 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl" itemprop="headline">
              {{ article.title }}
            </h1>
            <div class="flex items-center gap-3 text-sm text-gray-500">
              <time
                :datetime="formatDateISO(article.date_published)"
                itemprop="datePublished"
                class="flex items-center gap-1.5"
              >
                <UIcon name="i-heroicons-calendar" class="h-4 w-4" />
                {{ formatDate(article.date_published) }}
              </time>
            </div>
          </div>

          <!-- PDF Download (desktop) -->
          <div v-if="article.document" class="hidden md:block" itemprop="associatedMedia" itemscope itemtype="https://schema.org/DigitalDocument">
            <meta itemprop="encodingFormat" content="application/pdf" />
            <meta itemprop="url" :content="pdfUrl" />
            <meta itemprop="isAccessibleForFree" content="true" />
            <a
              :href="pdfUrl"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:scale-[0.98]"
              itemprop="url"
            >
              <UIcon name="i-heroicons-arrow-down-tray" class="h-4 w-4" />
              Télécharger le PDF
            </a>
          </div>

          <!-- Tags -->
          <!-- <div v-if="article.tags?.length" class="flex flex-wrap gap-2">
            <span
              v-for="tag in article.tags"
              :key="tag"
              class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              itemprop="keywords"
            >
              {{ tag }}
            </span>
          </div> -->

          <!-- Article Body -->
          <div class="rounded-2xl bg-white p-6 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700 sm:p-8">
            <div
              class="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-h2:mt-8 prose-h2:text-xl prose-p:leading-relaxed prose-a:text-blue-600 prose-img:rounded-xl dark:prose-a:text-blue-400"
              itemprop="articleBody"
              v-html="article.content"
            ></div>
          </div>

          <!-- Share & Social -->
          <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
            <SocialShare
              :title="article.title"
              :url="url"
            />
          </div>
        </div>
      </article>

      <!-- Not Found -->
      <div v-else class="mx-auto max-w-md py-16 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <UIcon name="i-heroicons-document-magnifying-glass" class="h-8 w-8 text-gray-400" />
        </div>
        <h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Article non trouvé</h2>
        <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Cet article n'existe pas ou a été supprimé.
        </p>
        <NuxtLink
          to="/actualites"
          class="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 active:scale-95 dark:bg-white dark:text-gray-900"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          Voir toutes les actualités
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