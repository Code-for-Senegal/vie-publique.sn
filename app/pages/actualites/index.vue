<script setup lang="ts">
import { useNews } from '~/composables/news/useNews';

const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const title = 'Actualités de la République du Sénégal | Vie-Publique.sn';
const description =
  "Suivez toute l'actualité de la République du Sénégal. Conseil des ministres, Assemblée nationale, vie politique et institutionnelle sénégalaise.";
const url = `${siteUrl}/actualites`;
const image = `${siteUrl}/images/share-linkedin.png`;

const newsCollectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: title,
  description: description,
  url: url,
  image: image,
  isPartOf: {
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
  },
  about: {
    '@type': 'GovernmentOrganization',
    name: 'République du Sénégal',
    description: "État souverain d'Afrique de l'Ouest",
  },
  mainEntity: {
    '@type': 'ItemList',
    name: 'Actualités République du Sénégal',
    description: 'Collection des dernières actualités de la République du Sénégal',
  },
};

const breadcrumbSchema = {
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
      item: url,
    },
  ],
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  name: siteName,
  url: siteUrl,
  logo: defaultImage,
  sameAs: ['https://twitter.com/viepubliquesn'],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'SN',
    addressLocality: 'Dakar',
  },
  publishingPrinciples: `${siteUrl}/ethique`,
  correctionsPolicy: `${siteUrl}/corrections`,
  missionCoveragePrioritiesPolicy: `${siteUrl}/mission`,
};

const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
  url: siteUrl,
  description: "Site d'information sur la vie publique et politique du Sénégal",
  inLanguage: 'fr-SN',
  isAccessibleForFree: true,
  publisher: {
    '@type': 'Organization',
    name: siteName,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/actualites?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: image,
  ogUrl: url,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  keywords: [
    ...keywords,
    'actualités Sénégal',
    'news République du Sénégal',
    'Conseil des ministres actualités',
    'Assemblée nationale news',
    'politique sénégalaise actualités',
    'gouvernement Sénégal news',
    'information République Sénégal',
  ].join(', '),
});

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
    { name: 'robots', content: 'index, follow' },
    { name: 'geo.region', content: 'SN' },
    { name: 'geo.placename', content: 'Dakar' },
    { name: 'geo.position', content: '14.7645042;-17.3660286' },
    { name: 'ICBM', content: '14.7645042, -17.3660286' },
    {
      name: 'news_keywords',
      content: 'Sénégal, actualités, politique, gouvernement, République',
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(newsCollectionSchema),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbSchema),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(organizationSchema),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(webSiteSchema),
    },
  ],
});

// Utilisation du composable useNews
const {
  articles,
  loading,
  error,
  categories,
  searchQuery,
  selectedCategory,
  currentPage,
  totalPages,
  totalItems,
  paginatedNews,
  setSearchQuery,
  setSelectedCategory,
} = useNews();

// Fonction pour formater l'URL des articles
const formatNewsUrl = (article: {
  id: string;
  title?: string;
  slug?: string;
  category?: {
    slug?: string;
  };
}) => {
  if (!article) return '/actualites';

  const id = article.id;
  const slug =
    article.slug ||
    (article.title
      ? article.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      : 'actualite');

  // Gestion spécifique selon la catégorie
  const categorySlug = article.category?.slug;

  if (categorySlug === 'conseil-des-ministres') {
    return `/conseil-des-ministres/${id}/${slug}`;
  }

  if (categorySlug === 'assemblee-nationale') {
    return `/assemblee-nationale/actualites/${id}/${slug}`;
  }

  return `/actualites/${id}/${slug}`;
};

// Ajout des couleurs pour les catégories
const getCategoryColor = (categoryName: string) => {
  const colorMap: Record<string, string> = {
    Toutes: '#6B7280',
    'Conseil des ministres': '#1D4ED8',
    'Conseil interministériel': '#7E22CE',
    'Assemblée nationale': '#047857',
    Article: '#EA580C',
    Budget: '#B91C1C',
    'Non catégorisé': '#4B5563',
  };
  return colorMap[categoryName] || '#6B7280';
};

const formatDateISO = (date: string) => {
  return new Date(date).toISOString();
};
</script>

<template>
  <div class="container mx-auto min-h-screen px-4 pb-16" itemscope itemtype="https://schema.org/CollectionPage">
    <AppBreadcrumb
      :items="[
        { label: 'Actualités' },
      ]"
    />

    <div class="prose prose-sm mx-auto my-2 sm:prose dark:prose-invert">
      <h1 class="text-center dark:text-white" itemprop="headline">Actualités</h1>
    </div>

    <!-- Filtres par catégorie -->
    <div class="mb-4">
      <!-- Barre de recherche -->
      <UInput
        :model-value="searchQuery"
        placeholder="Rechercher..."
        icon="i-heroicons-magnifying-glass"
        class="input custom-shadow mb-4 w-full dark:bg-gray-800 dark:text-white"
        size="lg"
        @update:model-value="setSearchQuery"
      />

      <!-- Skeleton pour les filtres pendant le chargement -->
      <div v-if="loading" class="flex flex-wrap gap-2">
        <div
          v-for="n in 5"
          :key="n"
          class="h-10 w-32 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
        ></div>
      </div>

      <!-- Liste des catégories -->
      <div v-else class="flex flex-wrap gap-2">
        <button
          v-for="category in categories"
          :key="category.name"
          class="flex items-center gap-1 rounded-full p-2 text-sm transition-colors duration-200"
          :class="{
            'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700':
              selectedCategory !== category.name,
            'text-white': selectedCategory === category.name,
          }"
          :style="{
            backgroundColor:
              selectedCategory === category.name ? getCategoryColor(category.name) : '',
          }"
          @click="setSelectedCategory(category.name)"
        >
          <div
            class="h-3 w-3 rounded-full"
            :style="{
              backgroundColor: getCategoryColor(category.name),
              opacity: selectedCategory === category.name ? 1 : 0.3,
            }"
          ></div>
          {{ category.name }}
        </button>
      </div>
    </div>

    <!-- Skeleton loader pendant le chargement -->
    <div v-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="n in 6" :key="n" class="animate-pulse">
        <div class="relative w-full">
          <div class="aspect-[16/9] rounded-t-lg bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div class="mt-4 space-y-3">
          <div class="h-6 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      title="Erreur de chargement"
      description="Une erreur est survenue lors du chargement des actualités"
    />

    <!-- Content -->
    <div v-else>
      <!-- Empty state -->
      <div
        v-if="!loading && (!articles.length || paginatedNews.length === 0)"
        class="mt-8 flex flex-col items-center text-center text-gray-500 dark:text-gray-400"
      >
        <UIcon
          name="i-heroicons-exclamation-circle"
          class="mb-4 h-16 w-16 text-gray-400 dark:text-gray-500"
        />
        <p class="text-xl">Aucun résultat disponible</p>
      </div>

      <!-- News grid -->
      <div v-else-if="!loading">
        <div
          class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          itemscope
          itemtype="https://schema.org/ItemList"
          itemprop="mainEntity"
        >
          <meta itemprop="numberOfItems" :content="`${paginatedNews.length}`" />

          <article
            v-for="(article, index) in paginatedNews"
            :key="article.id"
            itemscope
            itemtype="https://schema.org/NewsArticle"
            itemprop="itemListElement"
            class="custom-shadow group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border dark:border-gray-800 dark:bg-gray-900/50 dark:backdrop-blur-sm"
          >
            <meta itemprop="position" :content="`${index + 1}`" />
            <meta itemprop="url" :content="`${siteUrl}${formatNewsUrl(article)}`" />
            <meta itemprop="datePublished" :content="formatDateISO(article.date_published)" />

            <div itemprop="author" itemscope itemtype="https://schema.org/Organization">
              <meta itemprop="name" :content="siteName" />
            </div>

            <div itemprop="publisher" itemscope itemtype="https://schema.org/Organization">
              <meta itemprop="name" :content="siteName" />
              <meta itemprop="url" :content="siteUrl" />
            </div>

            <UCard>
              <NuxtLink :to="formatNewsUrl(article)" class="block" itemprop="url">
                <div class="relative">
                  <div itemprop="image" itemscope itemtype="https://schema.org/ImageObject">
                    <CmsImage
                      :src="article.cover_image"
                      :fallback="'/default-image-2.gif'"
                      :alt="article.title || 'Image actualité'"
                      class="h-48 w-full object-cover"
                      loading="lazy"
                      fetchpriority="high"
                      sizes="300px"
                      :placeholder="[300, 300]"
                      itemprop="contentUrl"
                    />
                    <meta
                      itemprop="url"
                      :content="
                        article.cover_image
                          ? useCmsImageAbsolute(article.cover_image)
                          : '/default-image-2.gif'
                      "
                    />
                    <meta itemprop="width" content="300" />
                    <meta itemprop="height" content="192" />
                  </div>

                  <div
                    class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4"
                  >
                    <span
                      class="rounded-full px-3 py-1 text-xs font-medium text-white"
                      :style="{
                        backgroundColor: getCategoryColor(
                          article.category?.name || 'Non catégorisé',
                        ),
                      }"
                      itemprop="articleSection"
                    >
                      {{ article.category?.name || 'Non catégorisé' }}
                    </span>
                  </div>
                </div>
                <div class="p-2">
                  <h2
                    class="group-hover:text-primary line-clamp-2 font-semibold transition-colors dark:text-gray-100"
                    itemprop="headline"
                  >
                    {{ article.title }}
                  </h2>
                  <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <time
                      :datetime="formatDateISO(article.date_published)"
                      itemprop="datePublished"
                    >
                      {{ $dateformatWithDayName(article.date_published) }}
                    </time>
                  </div>
                </div>

                <!-- Main entity of page -->
                <div itemprop="mainEntityOfPage" itemscope itemtype="https://schema.org/WebPage">
                  <meta itemprop="@id" :content="`${siteUrl}${formatNewsUrl(article)}`" />
                </div>
              </NuxtLink>
            </UCard>
          </article>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-8 flex justify-center">
          <UPagination
            v-model="currentPage"
            :total="totalItems"
            :default-page="1"
            :show-edges="true"
            :sibling-count="2"
            :active-button="{ color: 'yellow' }"
            :ui="{
              wrapper: 'flex items-center gap-1',
              base: 'min-w-8 min-h-8 flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
              active: 'bg-gray-900 text-white dark:bg-gray-700',
              inactive:
                'bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
