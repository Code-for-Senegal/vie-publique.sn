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
  <div class="container mx-auto min-h-screen px-2 py-2 pb-16" itemscope itemtype="https://schema.org/WebPage">
    <AppBreadcrumb
      :items="[
        { label: 'Actualités', to: '/actualites' },
        { label: article?.title || 'Article' },
      ]"
    />

    <!-- Loading state -->
    <div v-if="loading" class="space-y-4">
      <div class="h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      <div class="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      <div class="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      class="mt-4"
      title="Erreur"
      color="red"
      icon="i-heroicons-exclamation-triangle"
      description="Une erreur est survenue lors du chargement de l'article"
    />

    <!-- Content -->
    <article
      v-else-if="article"
      class="mx-auto max-w-4xl"
      itemscope
      itemtype="https://schema.org/NewsArticle"
      itemprop="mainEntity"
    >
      <!-- Schema.org hidden metadata -->
      <meta itemprop="url" :content="url" />
      <meta itemprop="datePublished" :content="formatDateISO(article.date_published)" />
      <meta
        itemprop="dateModified"
        :content="
          article.date_updated
            ? formatDateISO(article.date_updated)
            : formatDateISO(article.date_published)
        "
      />
      <meta itemprop="articleSection" :content="article.category?.name || 'Actualités'" />
      <meta itemprop="keywords" :content="article.tags?.join(', ') || 'République du Sénégal'" />
      <meta itemprop="inLanguage" content="fr-SN" />

      <!-- Publisher info -->
      <div itemprop="publisher" itemscope itemtype="https://schema.org/NewsMediaOrganization">
        <meta itemprop="name" :content="siteName" />
        <meta itemprop="url" :content="siteUrl" />
        <div itemprop="logo" itemscope itemtype="https://schema.org/ImageObject">
          <meta itemprop="url" :content="defaultImage" />
        </div>
      </div>

      <!-- Author info -->
      <div itemprop="author" itemscope itemtype="https://schema.org/Organization">
        <meta itemprop="name" :content="siteName" />
        <meta itemprop="url" :content="siteUrl" />
      </div>

      <!-- Main entity of page -->
      <div itemprop="mainEntityOfPage" itemscope itemtype="https://schema.org/WebPage">
        <meta itemprop="@id" :content="url" />
      </div>

      <header class="mb-4">
        <h1
          class="mb-2 text-2xl font-bold text-gray-900 md:text-4xl dark:text-white"
          itemprop="headline"
        >
          {{ article.title }}
        </h1>
        <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <UIcon name="i-heroicons-calendar" class="h-5 w-5" />
          <time :datetime="formatDateISO(article.date_published)" itemprop="datePublished">
            {{ formatDate(article.date_published) }}
          </time>
        </div>
      </header>

      <!-- Image principale -->
      <figure
        v-if="article.cover_image"
        itemprop="image"
        itemscope
        itemtype="https://schema.org/ImageObject"
        class="mb-2"
      >
        <CmsImage
          :src="article.cover_image"
          :alt="article.title"
          class="w-full rounded-lg object-contain shadow-sm"
          itemprop="contentUrl"
        />
        <meta itemprop="url" :content="useCmsImageAbsolute(article.cover_image)" />
        <meta itemprop="width" content="800" />
        <meta itemprop="height" content="450" />
        <meta itemprop="caption" :content="article.title" />
      </figure>

      <!-- Lien PDF si disponible -->
      <div v-if="article.document" class="my-4">
        <div itemprop="associatedMedia" itemscope itemtype="https://schema.org/DigitalDocument">
          <meta itemprop="encodingFormat" content="application/pdf" />
          <meta itemprop="url" :content="pdfUrl" />
          <meta itemprop="isAccessibleForFree" content="true" />

          <a
            :href="pdfUrl"
            target="_blank"
            class="flex items-center gap-2 text-blue-700 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            itemprop="url"
          >
            📥 Télécharger le PDF
          </a>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="article.tags?.length" class="mb-8 hidden flex-wrap gap-2">
        <span
          v-for="tag in article.tags"
          :key="tag"
          class="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
          itemprop="keywords"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Contenu -->
      <div
        class="prose prose-sm max-w-none sm:prose dark:prose-invert prose-a:text-blue-600 prose-img:rounded-lg dark:prose-a:text-blue-400"
        itemprop="articleBody"
        v-html="article.content"
      />

      <!-- About information -->
      <div itemprop="about" itemscope itemtype="https://schema.org/GovernmentOrganization">
        <meta itemprop="name" content="République du Sénégal" />
      </div>
    </article>

    <!-- Not found state -->
    <div v-else class="py-12 text-center text-gray-500 dark:text-gray-400">Article non trouvé</div>
  </div>
</template>
