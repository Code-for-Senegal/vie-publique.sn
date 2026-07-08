<script setup lang="ts">
import { useNews } from '~/composables/news/useNews';

const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const url = `${siteUrl}/conseil-des-ministres`;
const image = `${siteUrl}/images/share-conseil-des-ministres-nomination-full.jfif`;

// Utilisation du composable useNews avec la catégorie "Conseil des ministres"
const {
  articles,
  loading,
  error,
  searchQuery,
  currentPage,
  totalItems,
  totalPages,
  itemsPerPage,
  setSearchQuery,
  setCurrentPage,
} = useNews({
  category: 'Conseil des ministres',
  sort: '-date_published',
  limit: 9,
});

// SEO dynamique : titre basé sur la date du dernier communiqué
const formatDateFr = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const title = computed(() => {
  const latest = articles.value?.[0];
  if (latest?.date_published) {
    return `Conseil des ministres du ${formatDateFr(latest.date_published)}`;
  }
  return 'Conseil des ministres du Sénégal — Communiqués officiels';
});

const description = computed(() => {
  const latest = articles.value?.[0];
  if (latest?.date_published) {
    return `Dernier communiqué du conseil des ministres du ${formatDateFr(latest.date_published)}. Décisions, nominations et décrets du gouvernement du Sénégal.`;
  }
  return 'Communiqués du Conseil des ministres du Sénégal. Décisions, nominations et décrets du gouvernement.';
});

const conseilMinistresSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: title.value,
  description: description.value,
  url: url,
  image: image,
  isPartOf: {
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
  },
  about: {
    '@type': 'GovernmentOrganization',
    name: 'Conseil des ministres du Sénégal',
    description:
      'Organe exécutif du gouvernement sénégalais présidé par le Président de la République',
    parentOrganization: {
      '@type': 'GovernmentOrganization',
      name: 'République du Sénégal',
    },
  },
  mainEntity: {
    '@type': 'ItemList',
    name: 'Communiqués du Conseil des ministres',
    description: 'Collection des communiqués officiels du Conseil des ministres du Sénégal',
  },
}));

// Note SEO : le BreadcrumbList est émis par <AppBreadcrumb> (source unique),
// et Organization/WebPage par le @graph global de @nuxtjs/seo. On n'émet donc
// en page QUE le nœud d'entité propre : CollectionPage (cf. CLAUDE.md §7).

// SEO Meta Tags
useSeoMeta({
  title: () => title.value,
  ogTitle: () => title.value,
  description: () => description.value,
  ogDescription: () => description.value,
  ogImage: image,
  ogUrl: url,
  twitterCard: 'summary_large_image',
  twitterTitle: () => title.value,
  twitterDescription: () => description.value,
  twitterImage: image,
  keywords: [
    ...keywords,
    'communiqué conseil des ministres Sénégal',
    'décisions conseil des ministres',
    'nominations conseil des ministres',
    'compte rendu conseil des ministres',
    'décrets gouvernement Sénégal',
  ].join(', '),
});

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: 'Conseil des ministres du Sénégal' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
    { name: 'robots', content: 'index, follow' },
    { name: 'geo.region', content: 'SN' },
    { name: 'geo.placename', content: 'Dakar' },
    { name: 'geo.position', content: '14.7645042;-17.3660286' },
    { name: 'ICBM', content: '14.7645042, -17.3660286' },
    {
      name: 'news_keywords',
      content: 'Conseil des ministres, Sénégal, gouvernement, communiqué',
    },
  ],
  script: [
    {
      key: 'ld-conseil-ministres',
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify(conseilMinistresSchema.value)),
    },
  ],
});

const formatDateISO = (date: string) => {
  return new Date(date).toISOString();
};
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950"
    itemscope
    itemtype="https://schema.org/CollectionPage"
  >
    <!-- Schema.org hidden metadata -->
    <div
      class="hidden"
      itemprop="about"
      itemscope
      itemtype="https://schema.org/GovernmentOrganization"
    >
      <meta itemprop="name" content="Conseil des ministres du Sénégal" />
      <meta itemprop="url" :content="url" />
      <div
        itemprop="parentOrganization"
        itemscope
        itemtype="https://schema.org/GovernmentOrganization"
      >
        <meta itemprop="name" content="République du Sénégal" />
      </div>
      <div itemprop="leader" itemscope itemtype="https://schema.org/Person">
        <meta itemprop="name" content="Bassirou Diomaye Faye" />
        <meta itemprop="jobTitle" content="Président de la République du Sénégal" />
      </div>
    </div>

    <!-- Breadcrumb -->
    <div class="container mx-auto px-4">
      <AppBreadcrumb :items="[{ label: 'Conseil des ministres' }]" />
    </div>

    <!-- Sticky Header -->
    <header
      class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95"
    >
      <div class="container mx-auto px-4 py-3">
        <!-- Title Row -->
        <div class="flex items-center justify-between">
          <h1
            class="text-lg font-bold text-gray-900 dark:text-white sm:text-xl"
            itemprop="headline"
          >
            Conseil des ministres
          </h1>
          <span class="text-xs text-gray-500 dark:text-gray-400"
            >{{ totalItems }} communiqué{{ totalItems > 1 ? 's' : '' }}</span
          >
        </div>

        <!-- Search Input -->
        <div class="group relative mt-3">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <UIcon
              name="i-heroicons-magnifying-glass-20-solid"
              class="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-emerald-500"
            />
          </div>
          <input
            type="search"
            :value="searchQuery"
            placeholder="Rechercher un communiqué..."
            class="block w-full rounded-xl border-0 bg-gray-100 py-3 pl-11 pr-10 text-sm text-gray-900 ring-1 ring-transparent transition-all placeholder:text-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:bg-gray-800/80 sm:py-2.5"
            @input="setSearchQuery(($event.target as HTMLInputElement).value)"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            @click="setSearchQuery('')"
          >
            <span
              class="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600"
            >
              <UIcon
                name="i-heroicons-x-mark-20-solid"
                class="h-3.5 w-3.5 text-gray-600 dark:text-gray-300"
              />
            </span>
          </button>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 pt-4">
      <!-- Loading Skeleton -->
      <div
        v-if="loading"
        class="space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-3"
      >
        <div
          v-for="n in 6"
          :key="n"
          class="flex gap-3 rounded-xl bg-white p-2.5 ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800 sm:flex-col sm:gap-0 sm:p-0 sm:shadow-md sm:ring-0"
        >
          <USkeleton
            class="h-20 w-24 shrink-0 rounded-lg sm:h-40 sm:w-full sm:rounded-b-none sm:rounded-t-xl"
          />
          <div class="flex flex-1 flex-col justify-between py-0.5 sm:p-3">
            <div class="space-y-2">
              <USkeleton class="h-3 w-20 rounded" />
              <USkeleton class="h-4 w-full rounded" />
              <USkeleton class="h-4 w-3/4 rounded" />
            </div>
            <USkeleton class="mt-2 h-3 w-24 rounded" />
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-12">
        <div
          class="mx-auto max-w-sm rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20"
        >
          <div
            class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50"
          >
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="h-6 w-6 text-red-600 dark:text-red-400"
            />
          </div>
          <p class="text-sm font-medium text-red-900 dark:text-red-200">Erreur de chargement</p>
          <p class="mt-1 text-xs text-red-700 dark:text-red-300">
            Impossible de charger les communiqués
          </p>
          <button
            class="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 active:scale-95"
            @click="$router.go(0)"
          >
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
            Réessayer
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="articles.length === 0" class="py-16 text-center">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
        >
          <UIcon name="i-heroicons-document-magnifying-glass" class="h-8 w-8 text-gray-400" />
        </div>
        <p class="text-sm font-medium text-gray-900 dark:text-white">Aucun communiqué trouvé</p>
        <p class="mt-1 text-xs text-gray-500">Essayez une autre recherche</p>
        <button
          v-if="searchQuery"
          class="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 active:scale-95 dark:bg-gray-800 dark:text-gray-300"
          @click="setSearchQuery('')"
        >
          Effacer la recherche
        </button>
      </div>

      <!-- Content -->
      <div v-else itemscope itemtype="https://schema.org/ItemList" itemprop="mainEntity">
        <meta itemprop="numberOfItems" :content="`${articles.length}`" />

        <!-- Filter indicator -->
        <p v-if="searchQuery" class="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Recherche : "{{ searchQuery }}"
        </p>

        <!-- Mobile: Compact List / Desktop: Grid -->
        <div class="space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-3">
          <article
            v-for="(item, index) in articles"
            :key="item.id"
            itemscope
            itemtype="https://schema.org/GovernmentAnnouncement"
            itemprop="itemListElement"
          >
            <!-- Hidden Schema.org metadata -->
            <div class="hidden">
              <meta itemprop="position" :content="`${index + 1}`" />
              <meta
                itemprop="url"
                :content="`${siteUrl}/conseil-des-ministres/${item.id}/${item.slug}`"
              />
              <meta itemprop="datePublished" :content="formatDateISO(item.date_published)" />
              <div
                itemprop="publisher"
                itemscope
                itemtype="https://schema.org/GovernmentOrganization"
              >
                <meta itemprop="name" content="Conseil des ministres du Sénégal" />
              </div>
              <meta
                itemprop="name"
                :content="item.title || 'Communiqué du conseil des ministres'"
              />
              <meta itemprop="category" content="Communiqué gouvernemental" />
            </div>

            <NuxtLink
              :to="`/conseil-des-ministres/${item.id}/${item.slug}`"
              class="group flex gap-3 rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-gray-100 transition-all active:scale-[0.98] dark:bg-gray-900 dark:ring-gray-800 sm:flex-col sm:gap-0 sm:overflow-hidden sm:p-0 sm:shadow-md sm:ring-0 sm:hover:shadow-lg"
            >
              <!-- Image -->
              <div
                class="relative shrink-0"
                itemprop="image"
                itemscope
                itemtype="https://schema.org/ImageObject"
              >
                <CmsImage
                  :src="item.cover_image"
                  :alt="item.title || 'Communiqué du conseil des ministres'"
                  :quality="50"
                  :fallback="'/images/communique-conseil-des-ministres.jpeg'"
                  class="h-20 w-24 rounded-lg object-cover transition-transform duration-300 sm:h-40 sm:w-full sm:rounded-b-none sm:rounded-t-xl group-hover:sm:scale-105"
                  loading="lazy"
                  itemprop="contentUrl"
                />
                <meta
                  itemprop="url"
                  :content="
                    item.cover_image
                      ? useCmsImageAbsolute(item.cover_image, 50)
                      : '/images/communique-conseil-des-ministres.jpeg'
                  "
                />

                <!-- Date Badge (desktop only) -->
                <div
                  class="absolute bottom-0 left-0 right-0 hidden bg-gradient-to-t from-black/70 to-transparent p-3 sm:block"
                >
                  <time
                    v-if="item.date_published"
                    :datetime="formatDateISO(item.date_published)"
                    class="text-xs font-medium text-white"
                  >
                    {{ $dateformatWithDayName(item.date_published) }}
                  </time>
                </div>
              </div>

              <!-- Content -->
              <div class="flex min-w-0 flex-1 flex-col justify-between sm:p-3">
                <!-- Date (mobile only) -->
                <time
                  v-if="item.date_published"
                  :datetime="formatDateISO(item.date_published)"
                  class="mb-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 sm:hidden"
                  itemprop="datePublished"
                >
                  {{ $dateformatWithDayName(item.date_published) }}
                </time>

                <h2
                  class="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400 sm:line-clamp-3"
                  itemprop="headline"
                >
                  {{ item.title || 'Communiqué du conseil des ministres' }}
                </h2>

                <!-- Category label (mobile) -->
                <span class="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400 sm:hidden">
                  Conseil des ministres
                </span>
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
      </div>
    </main>

    <ScrollToTopButton />
  </div>
</template>
