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
    class="container mx-auto min-h-screen bg-white py-4 dark:bg-gray-900"
    itemscope
    itemtype="https://schema.org/CollectionPage"
  >
    <nav
      class="mb-6 flex items-center text-sm text-gray-500 dark:text-gray-400"
      aria-label="Breadcrumb"
    >
      <NuxtLink to="/" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
        Accueil
      </NuxtLink>
      <span class="mx-2 text-gray-300 dark:text-gray-600">/</span>
      <NuxtLink
        to="/assemblee-nationale"
        class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        Assemblée nationale
      </NuxtLink>
      <span class="mx-2 text-gray-300 dark:text-gray-600">/</span>
      <span class="font-medium text-gray-900 dark:text-white" aria-current="page">
        Questions écrites
      </span>
    </nav>

    <div class="mx-auto max-w-4xl">
      <div class="prose prose-sm my-2 sm:prose">
        <h1 class="mb-2 dark:text-gray-100" itemprop="headline">Questions écrites</h1>
      </div>

      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
      </div>

      <UAlert
        v-else-if="error"
        title="Erreur de chargement"
        description="Impossible de charger les questions écrites"
        color="red"
        icon="i-heroicons-exclamation-triangle"
      />

      <div v-else>
        <div class="mb-2 rounded-lg p-0">
          <h2 class="mb-4 text-xl font-bold dark:text-gray-100">Députés les plus actifs</h2>

          <div v-if="topDeputiesLoading" class="flex justify-center py-4">
            <UIcon name="i-heroicons-arrow-path" class="h-6 w-6 animate-spin" />
          </div>

          <div
            v-else
            class="grid grid-cols-2 gap-2 md:grid-cols-4"
            itemscope
            itemtype="https://schema.org/ItemList"
          >
            <meta itemprop="name" content="Députés les plus actifs" />
            <meta itemprop="numberOfItems" :content="topDeputies.length" />

            <div
              v-for="(deputy, index) in topDeputies"
              :key="deputy.id"
              class="custom-shadow relative flex flex-col items-center rounded-lg bg-white p-4 transition-all hover:shadow-md dark:bg-gray-800 dark:text-gray-100"
              itemscope
              itemtype="https://schema.org/Person"
              itemprop="itemListElement"
            >
              <meta itemprop="position" :content="index + 1" />
              <meta itemprop="identifier" :content="deputy.id" />

              <div
                class="absolute left-1/2 top-20 -translate-x-1/2 rounded-full px-3 py-1 text-sm font-bold text-white"
                :class="{
                  'bg-yellow-500': index === 0,
                  'bg-yellow-400': index === 1,
                  'bg-amber-700': index === 2,
                  'bg-gray-400': index === 3,
                }"
              >
                {{ index + 1 }}{{ index === 0 ? 'er' : 'ème' }}
              </div>

              <NuxtLink
                :to="`/assemblee-nationale/deputes/${deputy.id}/${$getSlugifyUrlPath(deputy.first_name + ' ' + deputy.last_name)}`"
                class="flex flex-col items-center"
                itemprop="url"
              >
                <CmsImage
                  :src="deputy.photo"
                  :alt="deputy.first_name"
                  class="mb-3 h-20 w-20 rounded-full object-cover shadow-sm"
                  itemprop="image"
                />
                <div class="text-center">
                  <div class="truncate font-medium capitalize text-gray-900 dark:text-gray-100">
                    <span itemprop="givenName">{{ deputy.first_name.toLowerCase() }}</span
                    ><br />
                    <span class="tracking-wider" itemprop="familyName">
                      {{ deputy.last_name.toUpperCase() }}
                    </span>
                  </div>
                  <meta itemprop="name" :content="`${deputy.first_name} ${deputy.last_name}`" />
                  <meta itemprop="jobTitle" content="Député" />
                  <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {{ deputy.questionsCount }} question{{ deputy.questionsCount > 1 ? 's' : '' }}
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <div id="questions-list" class="space-y-2" itemscope itemtype="https://schema.org/ItemList">
          <meta itemprop="name" content="Questions écrites parlementaires" />
          <meta itemprop="numberOfItems" :content="totalItems" />

          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-bold dark:text-gray-100">Questions</h2>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ totalItems }} questions au total
            </div>
          </div>

          <article
            v-for="(question, index) in paginatedQuestions"
            :key="question.id"
            itemscope
            itemtype="https://schema.org/Question"
            itemprop="itemListElement"
            class="custom-shadow transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            <meta itemprop="position" :content="(currentPage - 1) * itemsPerPage + index + 1" />
            <meta
              itemprop="url"
              :content="`${siteUrl}/assemblee-nationale/questions/${question.id}`"
            />
            <meta itemprop="dateCreated" :content="formatDateISO(question.question_date)" />

            <div itemprop="author" itemscope itemtype="https://schema.org/Person">
              <meta
                itemprop="name"
                :content="`${question.deputy.first_name} ${question.deputy.last_name}`"
              />
              <meta itemprop="jobTitle" content="Député" />
              <meta itemprop="image" :content="useCmsImageAbsolute(question.deputy.photo)" />
            </div>

            <UCard>
              <NuxtLink :to="`/assemblee-nationale/questions/${question.id}`">
                <div class="flex gap-4">
                  <div class="flex-shrink-0">
                    <CmsImage
                      :src="question.deputy.photo"
                      :alt="question.deputy.first_name"
                      class="h-20 w-20 rounded-full object-cover"
                      itemprop="image"
                    />
                  </div>
                  <div class="flex-grow">
                    <div class="mb-1 text-sm text-gray-500 dark:text-gray-400">
                      <time
                        :datetime="formatDateISO(question.question_date)"
                        itemprop="dateCreated"
                      >
                        {{ $dateformat(question.question_date) }}
                      </time>
                    </div>
                    <h2 class="text-normal mb-2 font-medium dark:text-gray-100" itemprop="name">
                      {{ question.subject }}
                    </h2>
                    <div
                      class="text-sm font-medium text-blue-900 dark:text-blue-300"
                      itemprop="author"
                    >
                      {{ question.deputy.first_name }}
                      {{ question.deputy.last_name }}
                    </div>
                  </div>
                  <div class="flex items-center">
                    <UIcon
                      name="i-heroicons-chevron-right"
                      class="h-5 w-5 text-gray-400 dark:text-gray-300"
                    />
                  </div>
                </div>
              </NuxtLink>
            </UCard>
          </article>

          <div class="mt-6 flex justify-center">
            <UPagination
              v-model="currentPage"
              :total="totalItems"
              :page-count="itemsPerPage"
              :default-page="1"
              :show-edges="true"
              :sibling-count="2"
              :active-button="{ color: 'yellow' }"
              :ui="{
                wrapper: 'flex items-center gap-1',
                base: 'min-w-8 min-h-8 flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
                active: 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900',
                inactive:
                  'bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
              }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
