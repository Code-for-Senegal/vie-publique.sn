<script setup lang="ts">
import { useNews } from "~/composables/news/useNews";

const { siteName, siteUrl, defaultImage, keywords, themeColor } =
  useSiteMetadata();

const route = useRoute();

// Utilisation du composable useNews avec l'ID
const { article, loading, error } = useNews({
  id: route.params.id as string,
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateISO = (date: string) => {
  return new Date(date).toISOString();
};

const title = computed(() => {
  if (!article.value) return "Chargement...";
  return `${article.value.title} | Assemblée nationale Sénégal`;
});

const description = computed(() => {
  if (!article.value) return "";
  // Extraire du texte brut du contenu HTML si disponible
  const plainText =
    article.value.content?.replace(/<[^>]*>/g, "") || article.value.title;
  const excerpt =
    plainText.length > 160 ? plainText.substring(0, 157) + "..." : plainText;
  return `${excerpt} Publié le ${formatDate(article.value.date_published)} par l'Assemblée nationale du Sénégal.`;
});

const url = computed(() => {
  if (!route.params.id || !route.params.slug) return siteUrl;
  return `${siteUrl}/assemblee-nationale/actualites/${route.params.id}/${route.params.slug}`;
});

const image = computed(() => {
  if (!article.value) return defaultImage;
  return article.value.cover_image
    ? useCmsImage(article.value.cover_image)
    : defaultImage;
});

const articleSchema = computed(() => {
  if (!article.value) return null;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.value.title,
    description: description.value,
    image: {
      "@type": "ImageObject",
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
      "@type": "Organization",
      name: "Assemblée nationale du Sénégal",
      url: `${siteUrl}/assemblee-nationale`,
    },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: defaultImage,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url.value,
    },
    articleSection: "Politique",
    keywords:
      article.value.tags?.join(", ") ||
      "Assemblée nationale, Sénégal, politique",
    about: {
      "@type": "GovernmentOrganization",
      name: "Assemblée nationale du Sénégal",
    },
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
    },
  };
});

const breadcrumbSchema = computed(() => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Accueil",
      item: siteUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Assemblée nationale",
      item: `${siteUrl}/assemblee-nationale`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Actualités",
      item: `${siteUrl}/assemblee-nationale/actualites`,
    },
    {
      "@type": "ListItem",
      position: 4,
      name: article.value?.title || "Article",
      item: url.value,
    },
  ],
}));

watchEffect(() => {
  if (article.value) {
    useSeoMeta({
      title: title.value,
      ogTitle: title.value,
      description: description.value,
      ogDescription: description.value,
      ogImage: image.value,
      ogUrl: url.value,
      twitterCard: "summary_large_image",
      twitterTitle: title.value,
      twitterDescription: description.value,
      twitterImage: image.value,
      keywords: [
        ...keywords,
        ...(article.value.tags || []),
        "actualités Assemblée nationale",
        "parlement Sénégal",
        "politique sénégalaise",
      ].join(", "),
    });

    // Head Configuration
    useHead({
      htmlAttrs: { lang: "fr-SN" },
      link: [{ rel: "canonical", href: url.value }],
      meta: [
        { name: "theme-color", content: themeColor },
        { name: "author", content: "Assemblée nationale du Sénégal" },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: siteName },
        {
          property: "article:published_time",
          content: formatDateISO(article.value.date_published),
        },
        {
          property: "article:modified_time",
          content: article.value.date_updated
            ? formatDateISO(article.value.date_updated)
            : formatDateISO(article.value.date_published),
        },
        { property: "article:section", content: "Politique" },
        {
          property: "article:tag",
          content: article.value.tags?.join(", ") || "",
        },
        { name: "robots", content: "index, follow" },
        { name: "geo.region", content: "SN" },
        { name: "geo.placename", content: "Dakar" },
        { name: "geo.position", content: "14.7645042;-17.3660286" },
        { name: "ICBM", content: "14.7645042, -17.3660286" },
        {
          name: "news_keywords",
          content:
            article.value.tags?.join(", ") || "Assemblée nationale, Sénégal",
        },
      ],
      script: [
        articleSchema.value
          ? {
              type: "application/ld+json",
              children: JSON.stringify(articleSchema.value),
            }
          : null,
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbSchema.value),
        },
      ].filter(Boolean),
    });
  }
});
</script>

<template>
  <div
    class="container mx-auto px-2 py-2"
    itemscope
    itemtype="https://schema.org/WebPage"
  >
    <!-- Bouton retour -->
    <NuxtLink
      to="/assemblee-nationale/actualites"
      class="mb-2 inline-flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-200"
    >
      <UIcon name="i-heroicons-arrow-left" class="mr-2 h-5 w-5" />
      Retour aux actualités
    </NuxtLink>

    <!-- Loading state -->
    <div v-if="loading" class="space-y-4">
      <div class="h-8 w-3/4 animate-pulse rounded bg-gray-200"></div>
      <div class="h-64 animate-pulse rounded-lg bg-gray-200"></div>
      <div class="h-4 animate-pulse rounded bg-gray-200"></div>
      <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="rounded-lg bg-red-50 p-4 text-center text-red-500"
    >
      {{ error }}
    </div>

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
      <meta
        itemprop="datePublished"
        :content="formatDateISO(article.date_published)"
      />
      <meta
        itemprop="dateModified"
        :content="
          article.date_updated
            ? formatDateISO(article.date_updated)
            : formatDateISO(article.date_published)
        "
      />
      <meta itemprop="articleSection" content="Politique" />
      <meta
        itemprop="keywords"
        :content="article.tags?.join(', ') || 'Assemblée nationale, Sénégal'"
      />

      <!-- Publisher info -->
      <div
        itemprop="publisher"
        itemscope
        itemtype="https://schema.org/NewsMediaOrganization"
      >
        <meta itemprop="name" :content="siteName" />
        <meta itemprop="url" :content="siteUrl" />
        <div
          itemprop="logo"
          itemscope
          itemtype="https://schema.org/ImageObject"
        >
          <meta itemprop="url" :content="defaultImage" />
        </div>
      </div>

      <!-- Author info -->
      <div
        itemprop="author"
        itemscope
        itemtype="https://schema.org/Organization"
      >
        <meta itemprop="name" content="Assemblée nationale du Sénégal" />
        <meta itemprop="url" :content="`${siteUrl}/assemblee-nationale`" />
      </div>

      <!-- Main entity of page -->
      <div
        itemprop="mainEntityOfPage"
        itemscope
        itemtype="https://schema.org/WebPage"
      >
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
          <time
            :datetime="formatDateISO(article.date_published)"
            itemprop="datePublished"
          >
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
          loading="eager"
          fetchpriority="high"
          itemprop="contentUrl"
        />
        <meta
          itemprop="url"
          :content="useCmsImageAbsolute(article.cover_image)"
        />
        <meta itemprop="width" content="800" />
        <meta itemprop="height" content="450" />
        <meta itemprop="caption" :content="article.title" />
      </figure>

      <!-- Tags -->
      <div v-if="article.tags?.length" class="mb-8 hidden flex-wrap gap-2">
        <span
          v-for="tag in article.tags"
          :key="tag"
          class="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600"
          itemprop="keywords"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Contenu -->
      <div
        class="prose prose-sm sm:prose prose-img:rounded-lg prose-a:text-blue-600 dark:prose-invert dark:prose-a:text-blue-400 max-w-none"
        itemprop="articleBody"
        v-html="article.content"
      />

      <!-- About information -->
      <div
        itemprop="about"
        itemscope
        itemtype="https://schema.org/GovernmentOrganization"
      >
        <meta itemprop="name" content="Assemblée nationale du Sénégal" />
        <meta itemprop="url" :content="`${siteUrl}/assemblee-nationale`" />
      </div>
    </article>

    <div v-else class="py-12 text-center text-gray-500 dark:text-gray-400">
      Article non trouvé
    </div>
  </div>
</template>
