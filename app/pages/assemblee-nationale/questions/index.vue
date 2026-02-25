<script setup lang="ts">
const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const title = "Questions écrites à l'Assemblée nationale du Sénégal | 15e législature";
const description =
  "Consultez toutes les questions écrites posées par les députés de la 15e législature de l'Assemblée nationale du Sénégal. Activité parlementaire et contrôle de l'action gouvernementale.";
const url = `${siteUrl}/assemblee-nationale/questions`;
const image = `${siteUrl}/images/questions-ecrites-assemblee.webp`;

const questionsCollectionSchema = {
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
    name: 'Assemblée nationale du Sénégal',
    description: 'Parlement de la République du Sénégal',
    url: `${siteUrl}/assemblee-nationale`,
  },
  mainEntity: {
    '@type': 'ItemList',
    name: 'Questions écrites parlementaires',
    description: 'Collection des questions écrites posées par les députés sénégalais',
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
      name: 'Assemblée nationale',
      item: `${siteUrl}/assemblee-nationale`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Questions écrites',
      item: url,
    },
  ],
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'LegislativeBuilding',
  name: 'Assemblée nationale du Sénégal',
  url: `${siteUrl}/assemblee-nationale`,
  description: 'Institution législative de la République du Sénégal',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Avenue Léopold Sédar Senghor',
    addressLocality: 'Dakar',
    addressCountry: 'SN',
  },
  governmentType: 'Legislature',
  numberOfMembers: 165,
  legislativeTerm: '15e législature',
};

const governmentServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'GovernmentService',
  name: 'Questions écrites parlementaires',
  description: "Service de questions écrites permettant aux députés d'interroger le gouvernement",
  provider: {
    '@type': 'GovernmentOrganization',
    name: 'Assemblée nationale du Sénégal',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Sénégal',
  },
  serviceType: 'Contrôle parlementaire',
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
    'questions écrites Assemblée nationale',
    'députés sénégalais questions',
    'contrôle parlementaire Sénégal',
    '15e législature questions',
    'activité parlementaire Sénégal',
    'questions gouvernement Sénégal',
    'parlement sénégalais contrôle',
  ].join(', '),
});

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: 'Assemblée nationale du Sénégal' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
    { name: 'robots', content: 'index, follow' },
    { name: 'geo.region', content: 'SN' },
    { name: 'geo.placename', content: 'Dakar' },
    { name: 'geo.position', content: '14.7645042;-17.3660286' },
    { name: 'ICBM', content: '14.7645042, -17.3660286' },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(questionsCollectionSchema),
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
      children: JSON.stringify(governmentServiceSchema),
    },
  ],
});

// ✅ Nouvelle architecture : useCmsCollection + useCollectionState
// Plus de onMounted() → SSR-friendly, pagination et recherche intégrées
const {
  questions,
  loading,
  error,
  currentPage,
  itemsPerPage,
  totalItems,
  topDeputies,
  topDeputiesLoading,
} = useAssemblyQuestions({ limit: 50, includeStats: true, topDeputiesLimit: 4 });

// Les questions sont déjà paginées côté serveur via useCmsCollection
const paginatedQuestions = computed(() => questions.value || []);

const formatDateISO = (date: string) => {
  return new Date(date).toISOString();
};
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-900"
    itemscope
    itemtype="https://schema.org/CollectionPage"
  >
    <!-- Schema.org metadata (hidden) -->
    <div class="hidden">
      <span itemprop="name">{{ title }}</span>
      <span itemprop="description">{{ description }}</span>
    </div>

    <!-- Breadcrumb -->
    <div class="container mx-auto hidden px-4 pt-4 md:block">
      <AppBreadcrumb
        :items="[
          { label: 'Assemblée nationale', to: '/assemblee-nationale' },
          { label: 'Questions écrites' }
        ]"
      />
    </div>

    <!-- Sticky Header mobile -->
    <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm md:relative md:border-0 md:bg-transparent md:backdrop-blur-none dark:border-gray-800 dark:bg-gray-900/95">
      <div class="container mx-auto px-4 py-3 md:py-6">
        <div class="flex items-center gap-3 md:justify-center">
          <!-- Back button mobile only -->
          <NuxtLink
            to="/assemblee-nationale"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200 md:hidden dark:bg-gray-800 dark:hover:bg-gray-700"
            aria-label="Retour"
          >
            <UIcon name="i-heroicons-arrow-left-20-solid" class="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </NuxtLink>
          <div class="min-w-0 flex-1 md:flex-none md:text-center">
            <h1 class="text-lg font-bold text-gray-900 md:text-2xl dark:text-white" itemprop="headline">
              Questions écrites
            </h1>
            <p v-if="!loading && totalItems" class="mt-0.5 text-xs text-gray-500 md:text-sm dark:text-gray-400">
              {{ totalItems }} questions au total
            </p>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-4">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-6">
        <!-- Top Deputies Skeleton -->
        <div>
          <USkeleton class="mb-3 h-5 w-40" />
          <div class="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div v-for="i in 4" :key="i" class="flex flex-col items-center rounded-xl bg-white p-4 dark:bg-gray-800">
              <USkeleton class="mb-2 h-16 w-16 rounded-full" />
              <USkeleton class="mb-1 h-3 w-20" />
              <USkeleton class="h-2 w-16" />
            </div>
          </div>
        </div>
        <!-- Questions Skeleton -->
        <div class="space-y-2">
          <USkeleton class="mb-3 h-5 w-24" />
          <div v-for="i in 5" :key="i" class="flex gap-3 rounded-xl bg-white p-3 dark:bg-gray-800">
            <USkeleton class="h-14 w-14 shrink-0 rounded-full" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-2 w-20" />
              <USkeleton class="h-4 w-full" />
              <USkeleton class="h-3 w-32" />
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-2xl bg-red-50 p-6 text-center dark:bg-red-900/20">
        <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto mb-3 h-10 w-10 text-red-500" />
        <h3 class="font-semibold text-red-800 dark:text-red-200">Erreur de chargement</h3>
        <p class="mt-1 text-sm text-red-600 dark:text-red-300">Impossible de charger les questions écrites</p>
      </div>

      <!-- Content -->
      <div v-else class="space-y-6">
        <!-- Top Deputies Section -->
        <section>
          <h2 class="mb-3 text-sm font-bold text-gray-900 md:text-lg dark:text-white">
            Députés les plus actifs
          </h2>

          <div v-if="topDeputiesLoading" class="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div v-for="i in 4" :key="i" class="flex flex-col items-center rounded-xl bg-white p-4 dark:bg-gray-800">
              <USkeleton class="mb-2 h-14 w-14 rounded-full" />
              <USkeleton class="mb-1 h-3 w-20" />
              <USkeleton class="h-2 w-16" />
            </div>
          </div>

          <div
            v-else
            class="grid grid-cols-2 gap-2 md:grid-cols-4"
            itemscope
            itemtype="https://schema.org/ItemList"
          >
            <meta itemprop="name" content="Députés les plus actifs" />
            <meta itemprop="numberOfItems" :content="topDeputies.length" />

            <NuxtLink
              v-for="(deputy, index) in topDeputies"
              :key="deputy.id"
              :to="`/assemblee-nationale/deputes/${deputy.id}/${$getSlugifyUrlPath(deputy.first_name + ' ' + deputy.last_name)}`"
              class="group relative flex flex-col items-center rounded-xl bg-white p-3 ring-1 ring-gray-100 transition-all active:scale-[0.98] md:p-4 md:hover:ring-blue-200 md:hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
              itemscope
              itemtype="https://schema.org/Person"
              itemprop="itemListElement"
            >
              <meta itemprop="position" :content="index + 1" />
              <meta itemprop="identifier" :content="deputy.id" />
              <meta itemprop="url" :content="`${siteUrl}/assemblee-nationale/deputes/${deputy.id}`" />

              <!-- Rank Badge -->
              <div
                class="absolute -right-1 -top-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white md:text-xs"
                :class="{
                  'bg-blue-500': index === 0,
                  'bg-blue-400': index === 1,
                  'bg-blue-600': index === 2,
                  'bg-gray-400': index === 3,
                }"
              >
                {{ index + 1 }}{{ index === 0 ? 'er' : 'e' }}
              </div>

              <CmsImage
                :src="deputy.photo"
                :alt="deputy.first_name"
                class="mb-2 h-14 w-14 rounded-full object-cover ring-2 ring-white md:h-16 md:w-16 dark:ring-gray-700"
                itemprop="image"
              />
              <div class="text-center">
                <p class="text-xs font-medium capitalize text-gray-900 md:text-sm dark:text-white">
                  <span itemprop="givenName">{{ deputy.first_name.toLowerCase() }}</span>
                  <span class="uppercase tracking-wide" itemprop="familyName">{{ deputy.last_name }}</span>
                </p>
                <meta itemprop="name" :content="`${deputy.first_name} ${deputy.last_name}`" />
                <meta itemprop="jobTitle" content="Député" />
                <p class="mt-0.5 text-[10px] text-blue-900 md:text-xs dark:text-blue-400">
                  {{ deputy.questionsCount }} question{{ deputy.questionsCount > 1 ? 's' : '' }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- Questions List -->
        <section id="questions-list" itemscope itemtype="https://schema.org/ItemList">
          <meta itemprop="name" content="Questions écrites parlementaires" />
          <meta itemprop="numberOfItems" :content="totalItems" />

          <h2 class="mb-3 text-sm font-bold text-gray-900 md:text-lg dark:text-white">
            Toutes les questions
          </h2>

          <!-- Questions - Mobile: compact list, Desktop: cards -->
          <div class="space-y-2">
            <NuxtLink
              v-for="(question, index) in paginatedQuestions"
              :key="question.id"
              :to="`/assemblee-nationale/questions/${question.id}`"
              class="group flex gap-3 rounded-xl bg-white p-3 ring-1 ring-gray-100 transition-all active:scale-[0.98] md:p-4 md:hover:ring-gray-200 md:hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
              itemscope
              itemtype="https://schema.org/Question"
              itemprop="itemListElement"
            >
              <meta itemprop="position" :content="(currentPage - 1) * itemsPerPage + index + 1" />
              <meta itemprop="url" :content="`${siteUrl}/assemblee-nationale/questions/${question.id}`" />
              <meta itemprop="dateCreated" :content="formatDateISO(question.question_date)" />

              <div itemprop="author" itemscope itemtype="https://schema.org/Person" class="hidden">
                <meta itemprop="name" :content="`${question.deputy.first_name} ${question.deputy.last_name}`" />
                <meta itemprop="jobTitle" content="Député" />
                <meta itemprop="image" :content="useCmsImageAbsolute(question.deputy.photo)" />
              </div>

              <!-- Photo -->
              <CmsImage
                :src="question.deputy.photo"
                :alt="question.deputy.first_name"
                class="h-12 w-12 shrink-0 rounded-full object-cover md:h-14 md:w-14"
                itemprop="image"
              />

              <!-- Content -->
              <div class="min-w-0 flex-1">
                <time
                  :datetime="formatDateISO(question.question_date)"
                  itemprop="dateCreated"
                  class="text-[10px] text-gray-400 md:text-xs"
                >
                  {{ $dateformat(question.question_date) }}
                </time>
                <h3
                  class="line-clamp-2 text-xs font-medium text-gray-900 md:text-sm dark:text-white"
                  itemprop="name"
                >
                  {{ question.subject }}
                </h3>
                <p class="mt-0.5 text-[10px] text-blue-900 md:text-xs dark:text-blue-400" itemprop="author">
                  {{ question.deputy.first_name }} {{ question.deputy.last_name }}
                </p>
              </div>

              <!-- Arrow -->
              <UIcon
                name="i-heroicons-chevron-right"
                class="h-4 w-4 shrink-0 self-center text-gray-300 md:hidden dark:text-gray-600"
              />
            </NuxtLink>
          </div>

          <!-- Pagination -->
          <div class="mt-6 flex justify-center">
            <UPagination
              v-model="currentPage"
              :total="totalItems"
              :page-count="itemsPerPage"
              :default-page="1"
              :show-edges="true"
              :sibling-count="1"
              size="sm"
              :active-button="{ color: 'yellow' }"
            />
          </div>
        </section>
      </div>
    </main>

    <ScrollToTopButton />
  </div>
</template>
