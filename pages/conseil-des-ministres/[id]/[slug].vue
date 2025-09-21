<script setup lang="ts">
import { useNews } from "~/composables/news/useNews";

const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();
const config = useRuntimeConfig();
const route = useRoute();

const { article, loading, error, fetchNewsById } = useNews({
  category: "conseil-des-ministres",
});

onMounted(async () => {
  if (route.params.id) {
    await fetchNewsById(route.params.id as string);
  }
});

const title = computed(() => {
  if (!article.value) return "Communiqué Conseil des ministres Sénégal";
  return `${article.value.title} | Conseil des ministres du Sénégal`;
});

const description = computed(() => {
  if (!article.value) return "Communiqué conseil des ministres du gouvernement du Sénégal";
  
  // Extraire du contenu HTML pour créer une description
  const htmlContent = article.value.content || article.value.title;
  const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const truncatedContent = textContent.length > 160 
    ? `${textContent.substring(0, 157)}...` 
    : textContent;
  
  return truncatedContent || article.value.title;
});

const url = computed(() => 
  `${siteUrl}/conseil-des-ministres/${route.params.id}/${route.params.slug}`
);

const image = computed(() => {
  if (article.value?.cover_image) {
    return article.value.cover_image.startsWith('http') 
      ? article.value.cover_image 
      : `${siteUrl}${article.value.cover_image}`;
  }
  return `${siteUrl}/images/share-conseil-des-ministres-nomination-full.jfif`;
});

const publishedDate = computed(() => 
  article.value?.date_published ? new Date(article.value.date_published).toISOString() : null
);

const modifiedDate = computed(() => 
  article.value?.date_updated ? new Date(article.value.date_updated).toISOString() : publishedDate.value
);

const articleSchema = computed(() => ({
  "@context": "https://schema.org",
  "@type": "GovernmentAnnouncement",
  "headline": article.value?.title || "Communiqué du Conseil des ministres",
  "name": article.value?.title || "Communiqué du Conseil des ministres",
  "description": description.value,
  "url": url.value,
  "image": {
    "@type": "ImageObject",
    "url": image.value,
    "width": 1200,
    "height": 630
  },
  "datePublished": publishedDate.value,
  "dateModified": modifiedDate.value || publishedDate.value,
  "author": {
    "@type": "GovernmentOrganization",
    "name": "Conseil des ministres du Sénégal",
    "url": `${siteUrl}/conseil-des-ministres`
  },
  "publisher": {
    "@type": "GovernmentOrganization",
    "name": "Conseil des ministres du Sénégal",
    "url": `${siteUrl}/conseil-des-ministres`,
    "logo": {
      "@type": "ImageObject",
      "url": `${siteUrl}/images/logo-senegal.png`,
      "width": 200,
      "height": 200
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": url.value
  },
  "articleSection": "Gouvernement",
  "genre": "Communiqué officiel",
  "keywords": [
    "Conseil des ministres",
    "Sénégal",
    "Gouvernement",
    "Communiqué officiel",
    "Bassirou Diomaye Faye",
    "Ousmane Sonko"
  ],
  "about": {
    "@type": "GovernmentOrganization",
    "name": "Conseil des ministres du Sénégal",
    "parentOrganization": {
      "@type": "GovernmentOrganization",
      "name": "République du Sénégal"
    }
  },
  "isPartOf": {
    "@type": "WebSite",
    "name": siteName,
    "url": siteUrl
  }
}));

const breadcrumbSchema = computed(() => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": siteUrl
    },
    {
      "@type": "ListItem", 
      "position": 2,
      "name": "Conseil des ministres",
      "item": `${siteUrl}/conseil-des-ministres`
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": article.value?.title || "Communiqué",
      "item": url.value
    }
  ]
}));

const governmentServiceSchema = computed(() => ({
  "@context": "https://schema.org",
  "@type": "GovernmentService",
  "name": "Publication des communiqués du Conseil des ministres",
  "description": "Service officiel de publication des décisions et communications du Conseil des ministres du Sénégal",
  "provider": {
    "@type": "GovernmentOrganization",
    "name": "Conseil des ministres du Sénégal"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Sénégal"
  },
  "serviceType": "Communication gouvernementale",
  "audience": {
    "@type": "Audience",
    "audienceType": "Citizens, Media, Public officials"
  }
}));

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
    "Conseil des ministres Sénégal",
    "communiqué conseil des ministres",
    "gouvernement Sénégal",
    "décisions gouvernementales",
    "Bassirou Diomaye Faye",
    "Ousmane Sonko",
    "politique sénégalaise",
    "République du Sénégal"
  ].join(", "),
});

useHead({
  htmlAttrs: { lang: "fr-SN" },
  link: [
    { rel: "canonical", href: url.value },
    { rel: "alternate", hreflang: "fr-SN", href: url.value },
    { rel: "alternate", hreflang: "fr", href: url.value }
  ],
  meta: [
    { name: "theme-color", content: themeColor },
    { name: "author", content: "Conseil des ministres du Sénégal" },
    { property: "og:type", content: "article" },
    { property: "og:site_name", content: siteName },
    { property: "article:published_time", content: publishedDate.value },
    { property: "article:modified_time", content: modifiedDate.value },
    { property: "article:author", content: "Conseil des ministres du Sénégal" },
    { property: "article:section", content: "Gouvernement" },
    { property: "article:tag", content: "Conseil des ministres, Sénégal, Gouvernement" },
    { name: "robots", content: "index, follow, max-image-preview:large" },
    { name: "googlebot", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
    { name: "geo.region", content: "SN" },
    { name: "geo.placename", content: "Dakar" },
    { name: "geo.position", content: "14.7645042;-17.3660286" },
    { name: "ICBM", content: "14.7645042, -17.3660286" },
    { name: "news_keywords", content: "Conseil des ministres, Sénégal, gouvernement, communiqué" },
    { name: "category", content: "Government" },
    { name: "coverage", content: "Worldwide" },
    { name: "distribution", content: "Global" },
    { name: "rating", content: "General" }
  ],
  script: [
    {
      type: "application/ld+json",
      children: () => JSON.stringify(articleSchema.value)
    },
    {
      type: "application/ld+json", 
      children: () => JSON.stringify(breadcrumbSchema.value)
    },
    {
      type: "application/ld+json",
      children: () => JSON.stringify(governmentServiceSchema.value)
    }
  ]
});

const links = [{ label: "communiqués", to: "/conseil-des-ministres" }];

// Fonction pour obtenir l'URL de l'asset via le nouveau proxy
const getAssetUrl = (assetId: string, slug: string) => {
  return useCmsFile(`${assetId}/${slug}.pdf`);
};

const formatDateISO = (date: string) => {
  return new Date(date).toISOString();
};
</script>

<template>
  <div class="container mx-auto px-4">
    <AppBreadcrumb :links="links" :last-text="route.params.slug" />

    <!-- Loading state -->
    <div v-if="loading" class="space-y-4">
      <div class="h-8 w-3/4 animate-pulse rounded bg-gray-200"></div>
      <div class="h-64 animate-pulse rounded-lg bg-gray-200"></div>
      <div class="h-4 animate-pulse rounded bg-gray-200"></div>
      <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
    </div>

    <div v-else-if="error" class="py-4 text-center text-red-500">
      {{ error }}
    </div>

    <template v-else-if="article">
      <article 
        itemscope 
        itemtype="https://schema.org/GovernmentAnnouncement"
        class="prose prose-sm sm:prose dark:prose-invert dark:prose-a:text-blue-400 mx-auto"
      >
        <!-- Schema.org hidden metadata -->
        <div itemprop="publisher" itemscope itemtype="https://schema.org/GovernmentOrganization">
          <meta itemprop="name" content="Conseil des ministres du Sénégal">
          <meta itemprop="url" :content="`${siteUrl}/conseil-des-ministres`">
        </div>

        <div itemprop="about" itemscope itemtype="https://schema.org/GovernmentOrganization">
          <meta itemprop="name" content="Conseil des ministres du Sénégal">
          
          <div itemprop="parentOrganization" itemscope itemtype="https://schema.org/GovernmentOrganization">
            <meta itemprop="name" content="République du Sénégal">
          </div>
        </div>

        <meta itemprop="url" :content="url">
        <meta itemprop="genre" content="Communiqué officiel">
        <meta itemprop="articleSection" content="Gouvernement">
        
        <h1 
          class="dark:text-white" 
          itemprop="headline name"
        >
          {{ article.title }}
        </h1>

        <div class="text-sm text-gray-600 dark:text-gray-400">
          <time 
            v-if="article.date_published"
            :datetime="formatDateISO(article.date_published)"
            itemprop="datePublished"
          >
            {{ $dateformatWithDayName(article.date_published) }}
          </time>
          
          <meta 
            v-if="article.date_updated"
            itemprop="dateModified" 
            :content="formatDateISO(article.date_updated)"
          >
        </div>

        <div v-if="article.cover_image" itemprop="image" itemscope itemtype="https://schema.org/ImageObject">
          <img
            :src="$directusImageUrl(article.cover_image, '100')"
            :alt="article.title"
            class="w-full object-cover"
            itemprop="contentUrl url"
          />
          <meta itemprop="width" content="800">
          <meta itemprop="height" content="450">
        </div>

        <!-- Lien PDF si disponible -->
        <div v-if="article.document" class="my-4">
          <a
            :href="getAssetUrl(article.document.file, article.slug)"
            target="_blank"
            class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-blue-800"
            rel="noopener"
          >
            📥 Télécharger le PDF
          </a>
        </div>

        <!-- Contenu HTML -->
        <div 
          v-html="article.content" 
          itemprop="articleBody"
        ></div>

        <!-- Mots-clés cachés pour le SEO -->
        <meta itemprop="keywords" content="Conseil des ministres, Sénégal, Gouvernement, Communiqué officiel">
      </article>
    </template>

    <div v-else class="py-4 text-center">
      <h1>Article non trouvé</h1>
      <p>Le communiqué demandé n'existe pas ou a été supprimé.</p>
    </div>

    <ScrollToTopButton />
  </div>
</template>

<style scoped>
:deep(.prose img) {
  @apply mx-auto;
}

:deep(.prose h1) {
  @apply text-2xl sm:text-3xl font-bold mb-4;
}

:deep(.prose h2) {
  @apply text-xl sm:text-2xl font-semibold mt-8 mb-4;
}

:deep(.prose p) {
  @apply mb-4 leading-relaxed;
}
</style>