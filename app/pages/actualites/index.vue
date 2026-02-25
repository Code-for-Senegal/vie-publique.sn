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
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950" itemscope itemtype="https://schema.org/CollectionPage">
    <!-- Breadcrumb -->
    <div class="container mx-auto px-4 pt-2">
      <AppBreadcrumb :items="[{ label: 'Actualités' }]" />
    </div>

    <!-- Sticky Header -->
    <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95">
      <div class="container mx-auto px-4 py-3">
        <!-- Title Row -->
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-bold text-gray-900 sm:text-xl dark:text-white" itemprop="headline">
            Actualités
          </h1>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ totalItems }} article{{ totalItems > 1 ? 's' : '' }}</span>
        </div>
        
        <!-- Search Input - Full Width, Prominent -->
        <div class="group relative mt-3">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <UIcon
              name="i-heroicons-magnifying-glass-20-solid"
              class="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-primary-500"
            />
          </div>
          <input
            type="search"
            :value="searchQuery"
            placeholder="Rechercher un article, un sujet..."
            class="block w-full rounded-xl border-0 bg-gray-100 py-3 pl-11 pr-10 text-sm text-gray-900 ring-1 ring-transparent transition-all placeholder:text-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 sm:py-2.5 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:bg-gray-800/80"
            @input="setSearchQuery(($event.target as HTMLInputElement).value)"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            @click="setSearchQuery('')"
          >
            <span class="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
              <UIcon name="i-heroicons-x-mark-20-solid" class="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" />
            </span>
          </button>
        </div>

        <!-- Category Filters - Horizontal Scroll -->
        <nav class="-mx-4 mt-3 overflow-x-auto px-4 scrollbar-hide" aria-label="Filtrer par catégorie">
          <div v-if="loading" class="flex gap-2">
            <USkeleton v-for="n in 5" :key="n" class="h-7 w-24 shrink-0 rounded-full" />
          </div>
          <div v-else class="flex gap-1.5">
            <button
              v-for="category in categories"
              :key="category.name"
              class="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95"
              :class="[
                selectedCategory === category.name
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700',
              ]"
              :style="selectedCategory === category.name ? { backgroundColor: getCategoryColor(category.name) } : {}"
              :aria-pressed="selectedCategory === category.name"
              @click="setSelectedCategory(category.name)"
            >
              <span
                v-if="selectedCategory !== category.name"
                class="h-2 w-2 rounded-full"
                :style="{ backgroundColor: getCategoryColor(category.name) }"
              />
              {{ category.name }}
              <span v-if="category.count" class="text-[10px] opacity-70">({{ category.count }})</span>
            </button>
          </div>
        </nav>
      </div>
    </header>

    <main class="container mx-auto px-4 pt-4">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-3">
        <div v-for="n in 6" :key="n" class="flex gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-gray-900">
          <USkeleton class="h-20 w-24 shrink-0 rounded-lg" />
          <div class="flex flex-1 flex-col justify-between py-0.5">
            <div class="space-y-2">
              <USkeleton class="h-3 w-16 rounded" />
              <USkeleton class="h-4 w-full rounded" />
              <USkeleton class="h-4 w-3/4 rounded" />
            </div>
            <USkeleton class="h-3 w-20 rounded" />
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-12">
        <div class="mx-auto max-w-sm rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <UIcon name="i-heroicons-exclamation-triangle" class="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <p class="text-sm font-medium text-red-900 dark:text-red-200">Erreur de chargement</p>
          <p class="mt-1 text-xs text-red-700 dark:text-red-300">Une erreur est survenue</p>
          <UButton color="red" variant="soft" size="sm" class="mt-4" @click="$router.go(0)">
            Réessayer
          </UButton>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!articles.length || paginatedNews.length === 0"
        class="py-16 text-center"
      >
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <UIcon name="i-heroicons-newspaper" class="h-8 w-8 text-gray-400" />
        </div>
        <p class="text-sm font-medium text-gray-900 dark:text-white">Aucun résultat</p>
        <p class="mt-1 text-xs text-gray-500">Essayez une autre recherche ou catégorie</p>
        <UButton
          v-if="searchQuery || selectedCategory !== 'Toutes'"
          color="gray"
          variant="soft"
          size="sm"
          class="mt-4"
          @click="setSearchQuery(''); setSelectedCategory('Toutes')"
        >
          Réinitialiser les filtres
        </UButton>
      </div>

      <!-- News List -->
      <div v-else itemscope itemtype="https://schema.org/ItemList" itemprop="mainEntity">
        <meta itemprop="numberOfItems" :content="`${paginatedNews.length}`" />

        <!-- Filter indicator -->
        <p v-if="selectedCategory !== 'Toutes' || searchQuery" class="mb-3 text-xs text-gray-500 dark:text-gray-400">
          <span v-if="selectedCategory !== 'Toutes'" class="inline-flex items-center gap-1">
            <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: getCategoryColor(selectedCategory) }" />
            {{ selectedCategory }}
          </span>
          <span v-if="searchQuery"> · "{{ searchQuery }}"</span>
        </p>

        <!-- Mobile: Compact List / Desktop: Grid -->
        <div class="space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-3">
          <article
            v-for="(article, index) in paginatedNews"
            :key="article.id"
            itemscope
            itemtype="https://schema.org/NewsArticle"
            itemprop="itemListElement"
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
            <div itemprop="mainEntityOfPage" itemscope itemtype="https://schema.org/WebPage">
              <meta itemprop="@id" :content="`${siteUrl}${formatNewsUrl(article)}`" />
            </div>

            <NuxtLink
              :to="formatNewsUrl(article)"
              class="group flex gap-3 rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-gray-100 transition-all active:scale-[0.98] sm:flex-col sm:gap-0 sm:p-0 sm:ring-0 sm:shadow-md sm:hover:shadow-lg dark:bg-gray-900 dark:ring-gray-800"
              itemprop="url"
            >
              <!-- Image -->
              <div class="relative shrink-0" itemprop="image" itemscope itemtype="https://schema.org/ImageObject">
                <CmsImage
                  :src="article.cover_image"
                  :fallback="'/default-image-2.gif'"
                  :alt="article.title || 'Image actualité'"
                  class="h-20 w-24 rounded-lg object-cover sm:h-40 sm:w-full sm:rounded-b-none sm:rounded-t-xl"
                  loading="lazy"
                  sizes="(max-width: 640px) 96px, 300px"
                  itemprop="contentUrl"
                />
                <meta
                  itemprop="url"
                  :content="article.cover_image ? useCmsImageAbsolute(article.cover_image) : '/default-image-2.gif'"
                />

                <!-- Category Badge (desktop only) -->
                <span
                  class="absolute bottom-2 left-2 hidden rounded-full px-2 py-0.5 text-[10px] font-medium text-white sm:inline-block"
                  :style="{ backgroundColor: getCategoryColor(article.category?.name || 'Non catégorisé') }"
                  itemprop="articleSection"
                >
                  {{ article.category?.name || 'Non catégorisé' }}
                </span>
              </div>

              <!-- Content -->
              <div class="flex min-w-0 flex-1 flex-col justify-between sm:p-3">
                <!-- Category (mobile only) -->
                <span
                  class="mb-1 inline-flex w-fit rounded px-1.5 py-0.5 text-[10px] font-medium text-white sm:hidden"
                  :style="{ backgroundColor: getCategoryColor(article.category?.name || 'Non catégorisé') }"
                >
                  {{ article.category?.name || 'Non catégorisé' }}
                </span>

                <h2
                  class="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 group-hover:text-primary-600 sm:line-clamp-3 dark:text-white"
                  itemprop="headline"
                >
                  {{ article.title }}
                </h2>

                <time
                  :datetime="formatDateISO(article.date_published)"
                  class="mt-1.5 text-[11px] text-gray-500 sm:mt-2 sm:text-xs dark:text-gray-400"
                  itemprop="datePublished"
                >
                  {{ $dateformatWithDayName(article.date_published) }}
                </time>
              </div>
            </NuxtLink>
          </article>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-8 flex justify-center">
          <UPagination
            v-model="currentPage"
            :total="totalItems"
            :page-count="12"
            size="sm"
            :ui="{
              wrapper: 'flex items-center gap-1',
              rounded: 'rounded-lg',
            }"
          />
        </div>
      </div>
    </main>
  </div>
</template>
