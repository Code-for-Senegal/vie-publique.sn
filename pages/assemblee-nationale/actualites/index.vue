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
    class="container mx-auto px-4 py-4"
    itemscope
    itemtype="https://schema.org/CollectionPage"
  >
    <NuxtLink
      to="/assemblee-nationale"
      class="mb-6 inline-flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
    >
      <UIcon name="i-heroicons-arrow-left" class="mr-2 h-5 w-5" />
      Retour aux actualités
    </NuxtLink>

    <div class="mx-auto max-w-7xl">
      <h1
        class="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white"
        itemprop="headline"
      >
        Actualités Assemblée
      </h1>

      <!-- Loading state -->
      <div
        v-if="loading"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div v-for="n in 6" :key="n" class="animate-pulse">
          <div class="relative w-full">
            <div
              class="aspect-[16/9] rounded-t-lg bg-gray-200 dark:bg-gray-700"
            ></div>
          </div>
          <div
            class="mt-4 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"
          ></div>
          <div
            class="mt-2 h-3 w-1/4 rounded bg-gray-200 dark:bg-gray-700"
          ></div>
        </div>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="rounded-lg bg-red-50 p-4 text-center text-red-500 dark:bg-red-900/50 dark:text-red-400"
      >
        {{ error }}
      </div>

      <!-- Content -->
      <div
        v-else
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
          class="group flex flex-col overflow-hidden rounded-lg bg-white shadow-xl transition-all dark:border dark:border-gray-800 dark:bg-gray-900/50 dark:backdrop-blur-sm"
        >
          <meta itemprop="position" :content="`${index + 1}`" />
          <meta
            itemprop="url"
            :content="`${siteUrl}/assemblee-nationale/actualites/${article.id}/${article.slug}`"
          />
          <meta
            itemprop="datePublished"
            :content="formatDateISO(article.date_published)"
          />
          <meta itemprop="publisher" content="Vie-Publique.sn" />

          <div
            itemprop="author"
            itemscope
            itemtype="https://schema.org/Organization"
          >
            <meta itemprop="name" content="Assemblée nationale du Sénégal" />
            <meta itemprop="url" :content="`${siteUrl}/assemblee-nationale`" />
          </div>

          <NuxtLink
            :to="`/assemblee-nationale/actualites/${article.id}/${article.slug}`"
            class="flex h-full flex-col"
            itemprop="url"
          >
            <!-- Image Container avec ratio fixe -->
            <div
              class="relative w-full"
              itemprop="image"
              itemscope
              itemtype="https://schema.org/ImageObject"
            >
              <div class="aspect-[16/9] overflow-hidden">
                <CmsImage
                  :src="article.cover_image"
                  :alt="article.title"
                  :quality="50"
                  class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  itemprop="contentUrl"
                />
                <meta
                  itemprop="url"
                  :content="useCmsImageAbsolute(article.cover_image, 50)"
                />
                <meta itemprop="width" content="800" />
                <meta itemprop="height" content="450" />
              </div>
            </div>

            <!-- Content -->
            <div class="flex flex-1 flex-col p-4">
              <h2
                class="mb-2 line-clamp-2 flex-grow font-semibold text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400"
                itemprop="headline"
              >
                {{ article.title }}
              </h2>

              <div
                class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
              >
                <UIcon name="i-heroicons-calendar" class="h-4 w-4" />
                <time
                  :datetime="formatDateISO(article.date_published)"
                  itemprop="datePublished"
                >
                  {{ formatDate(article.date_published) }}
                </time>
              </div>

              <!-- Tags -->
              <div
                v-if="article.tags?.length"
                class="mt-3 flex flex-wrap gap-2"
              >
                <span
                  v-for="tag in article.tags"
                  :key="tag"
                  class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  itemprop="keywords"
                >
                  {{ tag }}
                </span>
              </div>
              <div v-else class="mt-3 text-sm text-gray-500 dark:text-gray-400">
                <span
                  itemprop="keywords"
                  class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  >assemblée nationale</span
                >
              </div>

              <!-- Schema.org mainEntityOfPage -->
              <div
                itemprop="mainEntityOfPage"
                itemscope
                itemtype="https://schema.org/WebPage"
              >
                <meta
                  itemprop="@id"
                  :content="`${siteUrl}/assemblee-nationale/actualites/${article.id}/${article.slug}`"
                />
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>

      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <UPagination
          :model-value="currentPage"
          :total="totalItems"
          :default-page="1"
          :show-edges="true"
          :sibling-count="2"
          :active-button="{ color: 'yellow' }"
          :ui="{
            wrapper: 'flex items-center gap-1',
            base: 'min-w-8 min-h-8 flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
            active: 'bg-gray-900 text-white',
            inactive: 'bg-white text-gray-900 hover:bg-gray-100',
          }"
          @update:model-value="setCurrentPage"
        />
      </div>

      <!-- Empty state -->
      <div
        v-if="!loading && !error && articles.length === 0"
        class="py-12 text-center text-gray-500 dark:text-gray-400"
      >
        Aucun article disponible pour le moment
      </div>
    </div>
  </div>
</template>
