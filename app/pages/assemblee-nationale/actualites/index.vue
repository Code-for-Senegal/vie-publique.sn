<script setup lang="ts">
import { useNews } from "~/composables/news/useNews";

const { siteName, siteUrl, defaultImage, keywords, themeColor } =
  useSiteMetadata();

const title =
  "Actualités de l'Assemblée nationale du Sénégal | Vie-Publique.sn";
const description =
  "Suivez toutes les actualités de l'Assemblée nationale du Sénégal. Débats parlementaires, votes, commissions et activités des députés en temps réel.";
const url = `${siteUrl}/assemblee-nationale/actualites`;
const image = `${siteUrl}/images/assemblee-nationale-actualites.webp`;

const newsCollectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: title,
  description: description,
  url: url,
  image: image,
  isPartOf: {
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  },
  about: {
    "@type": "GovernmentOrganization",
    name: "Assemblée nationale du Sénégal",
    url: `${siteUrl}/assemblee-nationale`,
  },
  mainEntity: {
    "@type": "ItemList",
    name: "Actualités Assemblée nationale",
    description:
      "Liste des dernières actualités de l'Assemblée nationale du Sénégal",
  },
};

const breadcrumbSchema = {
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
      item: url,
    },
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: siteName,
  url: siteUrl,
  logo: defaultImage,
  sameAs: ["https://twitter.com/viepubliquesn"],
  address: {
    "@type": "PostalAddress",
    addressCountry: "SN",
    addressLocality: "Dakar",
  },
  publishingPrinciples: `${siteUrl}/ethique`,
  correctionsPolicy: `${siteUrl}/corrections`,
};

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: image,
  ogUrl: url,
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  keywords: [
    ...keywords,
    "actualités Assemblée nationale Sénégal",
    "débats parlementaires Sénégal",
    "votes députés Sénégal",
    "commissions parlementaires",
    "activité législative Sénégal",
    "parlement sénégalais news",
    "politique sénégalaise actualités",
  ].join(", "),
});

useHead({
  htmlAttrs: { lang: "fr-SN" },
  link: [{ rel: "canonical", href: url }],
  meta: [
    { name: "theme-color", content: themeColor },
    { name: "author", content: siteName },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { name: "robots", content: "index, follow" },
    { name: "geo.region", content: "SN" },
    { name: "geo.placename", content: "Dakar" },
    { name: "geo.position", content: "14.7645042;-17.3660286" },
    { name: "ICBM", content: "14.7645042, -17.3660286" },
    {
      name: "news_keywords",
      content:
        "Assemblée nationale, Sénégal, politique, débats, votes, députés",
    },
  ],
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify(newsCollectionSchema),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(breadcrumbSchema),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(organizationSchema),
    },
  ],
});

// Utilisation du composable useNews avec la catégorie "Assemblée nationale"
const {
  articles,
  loading,
  error,
  totalPages,
  currentPage,
  totalItems,
  itemsPerPage,
  setCurrentPage,
} = useNews({
  category: "Assemblée nationale",
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
</script>

<template>
  <div
    class="min-h-screen bg-gray-50/50 dark:bg-gray-900"
    itemscope
    itemtype="https://schema.org/CollectionPage"
  >
    <!-- Sticky Header (mobile only) -->
    <header class="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95 md:relative md:border-0 md:bg-transparent md:backdrop-blur-none dark:md:bg-transparent">
      <div class="container mx-auto px-4">
        <div class="flex items-center gap-3 py-3">
          <!-- Back button (mobile) -->
          <NuxtLink
            to="/assemblee-nationale"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 active:scale-95 md:hidden dark:bg-gray-800 dark:text-gray-400"
            aria-label="Retour"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          </NuxtLink>

          <div class="min-w-0 flex-1">
            <h1 class="text-lg font-bold text-gray-900 md:text-2xl dark:text-white" itemprop="headline">
              Actualités Assemblée
            </h1>
            <p class="text-xs text-gray-500 md:text-sm">
              {{ totalItems }} article{{ totalItems > 1 ? 's' : '' }}
            </p>
          </div>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-6">
      <AppBreadcrumb
        :items="[
          { label: 'Assemblée nationale', to: '/assemblee-nationale' },
          { label: 'Actualités' }
        ]"
      />

      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-3">
        <div v-for="n in 6" :key="n" class="flex gap-3 rounded-xl bg-white p-2.5 ring-1 ring-gray-100 sm:flex-col sm:gap-0 sm:p-0 sm:ring-0 sm:shadow-md dark:bg-gray-800 dark:ring-gray-700">
          <USkeleton class="h-20 w-24 shrink-0 rounded-lg sm:h-40 sm:w-full sm:rounded-b-none sm:rounded-t-xl" />
          <div class="flex flex-1 flex-col justify-between py-0.5 sm:p-3">
            <div class="space-y-2">
              <USkeleton class="h-3 w-16 rounded" />
              <USkeleton class="h-4 w-full rounded" />
              <USkeleton class="h-4 w-3/4 rounded" />
            </div>
            <USkeleton class="mt-2 h-3 w-20 rounded" />
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="py-12">
        <div class="mx-auto max-w-sm rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <UIcon name="i-heroicons-exclamation-triangle" class="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <p class="text-sm font-medium text-red-900 dark:text-red-200">Erreur de chargement</p>
          <p class="mt-1 text-xs text-red-700 dark:text-red-300">Impossible de charger les actualités</p>
          <button
            class="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 active:scale-95"
            @click="$router.go(0)"
          >
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
            Réessayer
          </button>
        </div>
      </div>

      <!-- Content -->
      <div
        v-else
        class="space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-3"
        itemscope
        itemtype="https://schema.org/ItemList"
      >
        <meta itemprop="numberOfItems" :content="`${articles.length}`" />

        <article
          v-for="(article, index) in articles"
          :key="article.id"
          itemscope
          itemtype="https://schema.org/NewsArticle"
          itemprop="itemListElement"
        >
          <!-- Hidden Schema.org metadata -->
          <div class="hidden">
            <meta itemprop="position" :content="`${index + 1}`" />
            <meta itemprop="url" :content="`${siteUrl}/assemblee-nationale/actualites/${article.id}/${article.slug}`" />
            <meta itemprop="datePublished" :content="formatDateISO(article.date_published)" />
            <meta itemprop="publisher" content="Vie-Publique.sn" />
            <div itemprop="author" itemscope itemtype="https://schema.org/Organization">
              <meta itemprop="name" content="Assemblée nationale du Sénégal" />
              <meta itemprop="url" :content="`${siteUrl}/assemblee-nationale`" />
            </div>
            <div itemprop="mainEntityOfPage" itemscope itemtype="https://schema.org/WebPage">
              <meta itemprop="@id" :content="`${siteUrl}/assemblee-nationale/actualites/${article.id}/${article.slug}`" />
            </div>
          </div>

          <NuxtLink
            :to="`/assemblee-nationale/actualites/${article.id}/${article.slug}`"
            class="group flex gap-3 rounded-xl bg-white p-2.5 ring-1 ring-gray-100 transition-all active:scale-[0.98] sm:flex-col sm:gap-0 sm:overflow-hidden sm:rounded-2xl sm:p-0 sm:shadow-md sm:ring-0 sm:hover:shadow-lg dark:bg-gray-800 dark:ring-gray-700"
          >
            <!-- Image -->
            <div class="relative shrink-0" itemprop="image" itemscope itemtype="https://schema.org/ImageObject">
              <CmsImage
                :src="article.cover_image"
                :alt="article.title"
                :quality="50"
                class="h-20 w-24 rounded-lg object-cover transition-transform duration-300 group-hover:sm:scale-105 sm:h-40 sm:w-full sm:rounded-b-none sm:rounded-t-xl"
                loading="lazy"
                itemprop="contentUrl"
              />
              <meta itemprop="url" :content="useCmsImageAbsolute(article.cover_image, 50)" />
              
              <!-- Tag Badge (desktop only) -->
              <span
                v-if="article.tags?.length"
                class="absolute bottom-2 left-2 hidden rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white sm:inline-block"
              >
                {{ article.tags[0] }}
              </span>
              <span
                v-else
                class="absolute bottom-2 left-2 hidden rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white sm:inline-block"
              >
                assemblée nationale
              </span>
            </div>

            <!-- Content -->
            <div class="flex min-w-0 flex-1 flex-col justify-between sm:p-3">
              <!-- Tag (mobile only) -->
              <span
                v-if="article.tags?.length"
                class="mb-1 inline-flex w-fit rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white sm:hidden"
              >
                {{ article.tags[0] }}
              </span>
              <span
                v-else
                class="mb-1 inline-flex w-fit rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white sm:hidden"
              >
                assemblée nationale
              </span>

              <h2
                class="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 group-hover:text-blue-600 sm:line-clamp-3 dark:text-white dark:group-hover:text-blue-400"
                itemprop="headline"
              >
                {{ article.title }}
              </h2>

              <time
                :datetime="formatDateISO(article.date_published)"
                class="mt-1.5 text-[11px] text-gray-500 sm:mt-2 sm:text-xs dark:text-gray-400"
                itemprop="datePublished"
              >
                {{ formatDate(article.date_published) }}
              </time>
            </div>
          </NuxtLink>
        </article>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <UPagination
          :model-value="currentPage"
          :total="totalItems"
          :page-count="itemsPerPage"
          size="sm"
          :ui="{
            wrapper: 'flex items-center gap-1',
            rounded: 'rounded-lg',
          }"
          @update:model-value="setCurrentPage"
        />
      </div>

      <!-- Empty state -->
      <div
        v-if="!loading && !error && articles.length === 0"
        class="py-16 text-center"
      >
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <UIcon name="i-heroicons-newspaper" class="h-8 w-8 text-gray-400" />
        </div>
        <p class="text-sm font-medium text-gray-900 dark:text-white">Aucune actualité</p>
        <p class="mt-1 text-xs text-gray-500">Aucun article disponible pour le moment</p>
      </div>
    </div>

    <ScrollToTopButton />
  </div>
</template>
