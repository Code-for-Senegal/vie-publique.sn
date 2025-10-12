<script setup lang="ts">
const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata()

const title = 'Nominations du Président Diomaye Faye | Annuaire Sénégal'
const description =
  'Liste complète des nominations du président Bassirou Diomaye Faye au Sénégal. Ministres, Directeurs généraux, PCA et toutes les nominations officielles.'
const url = `${siteUrl}/nomination-senegal`
const image = `${siteUrl}/nomination-3.png`

const nominationsSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description: description,
  url: url,
  image: image,
  isPartOf: {
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
  },
  about: [
    {
      '@type': 'Person',
      name: 'Bassirou Diomaye Faye',
      jobTitle: 'Président de la République du Sénégal',
    },
    {
      '@type': 'GovernmentOrganization',
      name: 'Gouvernement du Sénégal',
    },
  ],
  mainEntity: {
    '@type': 'ItemList',
    name: 'Nominations présidentielles Sénégal',
    description: 'Liste des nominations officielles du président Diomaye Faye',
  },
}

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
      name: 'Annuaires',
      item: `${siteUrl}/annuaires`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Nominations',
      item: url,
    },
  ],
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'GovernmentOrganization',
  name: 'Gouvernement du Sénégal',
  url: url,
  description:
    'Nominations officielles du gouvernement sénégalais sous la présidence de Bassirou Diomaye Faye',
  leader: {
    '@type': 'Person',
    name: 'Bassirou Diomaye Faye',
    jobTitle: 'Président de la République',
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'SN',
    addressLocality: 'Dakar',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Sénégal',
  },
}

// SEO Meta Tags
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
    'nominations Bassirou Diomaye Faye',
    'gouvernement Sénégal 2024',
    'ministres Sénégal',
    'directeurs généraux Sénégal',
    'PCA Sénégal',
    'nominations présidentielles',
    'nouveau gouvernement sénégalais',
    'conseil des ministres',
  ].join(', '),
})

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
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(nominationsSchema),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbSchema),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(organizationSchema),
    },
  ],
})

const { $dateformat } = useNuxtApp()
const route = useRoute()

const {
  nominations,
  loading,
  error,
  currentPage,
  searchQuery,
  filterType,
  filterGender,
  totalItems,
  totalPages,
  totalsByType,
  totalsByGender,
  setCurrentPage,
  setSearchQuery,
  setFilterType,
  setFilterGender,
} = useNominations()

// Fonction pour créer l'URL vers détails en gardant les filtres actuels
const getDetailUrl = (minister: any) => {
  const slug = minister.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // Récupère les query params actuels
  const query = { ...route.query }

  return {
    path: `/nomination-senegal/${minister.id}/${slug}`,
    query
  }
}

// Reset de la page lors du changement de recherche
watch(searchQuery, () => {
  filterType.value = 'all'
  filterGender.value = 'all'
  currentPage.value = 1
})

// Reset de la page lors du changement de filtres
watch([filterType, filterGender], () => {
  currentPage.value = 1
})
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <h1 class="sr-only mb-4 text-sm text-gray-500">
      Membres du gouvernement du Sénégal, Nouveau gouvernement Sénégal Diomaye Sonko, Conseil des
      ministres, Liste des ministres du Sénégal,
    </h1>
    <div class="container">
      <div class="prose prose-sm sm:prose my-2">
        <h1 class="">
          {{ totalsByGender.maleCount + totalsByGender.femaleCount }} Nominations
          <!--du président Diomaye-->
        </h1>
      </div>
    </div>

    <p class="sr-only mb-4 text-sm text-gray-500">Ministres, Secrétaires, Directeurs, PCA...</p>

    <div class="w-full max-w-4xl">
      <!-- Conteneur principal avec grid -->

      <div class="grid grid-cols-1 gap-2 lg:grid-cols-4">
        <!-- Colonne des filtres (1/4 en desktop) -->
        <div class="lg:col-span-1">
          <!-- recherche -->
          <UInput
            :model-value="searchQuery"
            class="input custom-shadow mb-3 w-full"
            size="lg"
            icon="i-heroicons-magnifying-glass"
            placeholder="Rechercher une nomination..."
            @update:model-value="setSearchQuery"
          >
          </UInput>

          <div class="mb-1 w-full text-center">
            <UButton
              :ui="{ rounded: 'rounded-full' }"
              class="custom-shadow mb-1 ml-1 text-sm font-normal transition-all duration-300 ease-in-out"
              :color="filterGender === 'Monsieur' ? 'primary' : 'white'"
              size="sm"
              @click="setFilterGender(filterGender === 'Monsieur' ? 'all' : 'Monsieur')"
            >
              Hommes
              <UBadge
                :ui="{ rounded: 'rounded-full' }"
                :label="totalsByGender.maleCount"
                :color="filterGender === 'Monsieur' ? 'primary' : 'primary'"
                :variant="filterGender === 'Monsieur' ? 'soft' : 'solid'"
                size="xs"
              ></UBadge>
            </UButton>
            <UButton
              :ui="{ rounded: 'rounded-full' }"
              class="custom-shadow mb-1 ml-1 text-sm font-normal transition-all duration-300 ease-in-out"
              :color="filterGender === 'Madame' ? 'primary' : 'white'"
              size="sm"
              @click="setFilterGender(filterGender === 'Madame' ? 'all' : 'Madame')"
            >
              Femmes
              <UBadge
                :ui="{ rounded: 'rounded-full' }"
                :label="totalsByGender.femaleCount"
                color="primary"
                :variant="filterGender === 'Madame' ? 'soft' : 'solid'"
                size="xs"
              ></UBadge>
            </UButton>
          </div>

          <div class="mb-2 w-full text-center">
            <UButton
              v-for="(total, type) in totalsByType"
              :key="type"
              :ui="{ rounded: 'rounded-full' }"
              :color="filterType === type ? 'primary' : 'white'"
              class="custom-shadow mb-1 ml-1 text-sm font-normal transition-all duration-300 ease-in-out"
              size="sm"
              @click="setFilterType(filterType === type ? 'all' : type)"
            >
              {{ type }}
              <UBadge
                :ui="{ rounded: 'rounded-full' }"
                :label="total"
                color="primary"
                :variant="filterType === type ? 'soft' : 'solid'"
                size="xs"
              ></UBadge>
            </UButton>
          </div>
        </div>

        <!-- Colonne de la liste des nominations (3/4 en desktop) -->
        <div class="space-y-2 lg:col-span-3">
          <!-- État de chargement - Skeleton loaders -->
          <template v-if="loading">
            <UCard
              v-for="i in 5"
              :key="`skeleton-${i}`"
              class="custom-shadow"
            >
              <div class="flex flex-row gap-2 animate-pulse">
                <!-- Skeleton photo -->
                <div
                  class="h-16 w-16 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700 md:h-20 md:w-20"
                ></div>
                <!-- Skeleton texte -->
                <div class="flex-grow space-y-2">
                  <div class="h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-700"></div>
                  <div class="h-3 w-full rounded bg-gray-200 dark:bg-gray-600"></div>
                  <div class="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-600"></div>
                  <div class="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-600"></div>
                </div>
              </div>
            </UCard>
          </template>

          <!-- État d'erreur -->
          <div v-else-if="error" class="py-8 text-center text-red-500">
            <p>Erreur lors du chargement des nominations</p>
          </div>

          <!-- Liste des nominations -->
          <template v-else>
            <NuxtLink
              v-for="minister in nominations"
              :key="minister.name"
              :to="getDetailUrl(minister)"
              class="block"
            >
              <UCard class="custom-shadow transition-shadow hover:shadow-lg">
                <div class="flex flex-row gap-2">
                  <div class="h-16 w-16 flex-shrink-0 md:h-20 md:w-20">
                    <img
                      :src="minister.photo || '/unknown_member.webp'"
                      alt="Photo ministre"
                      sizes="64px sm:80px"
                      class="h-full w-full rounded-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div class="flex-grow">
                    <h2 class="font-semibold">{{ minister.name }}</h2>
                    <p class="text-sm">{{ minister.role }}</p>
                    <p v-if="minister.organisation" class="text-sm text-gray-500">
                      {{ minister.organisation }}
                    </p>
                    <p class="text-sm text-gray-500">
                      Nommé le
                      {{ $dateformat(minister.nominationDate) }}
                    </p>
                    <p v-if="minister.endDate" class="text-sm text-gray-500">
                      Limogé le
                      {{ $dateformat(minister.endDate) }}
                    </p>
                  </div>
                </div>
              </UCard>
            </NuxtLink>

            <!-- Message si aucun résultat -->
            <div v-if="nominations.length === 0" class="py-8 text-center">
              <p>Aucune nomination trouvée</p>
            </div>
          </template>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex justify-end border-t border-gray-200 px-3 py-3.5 dark:border-gray-700"
      >
        <UPagination
          :model-value="currentPage"
          size="md"
          :page-count="25"
          :total="totalItems"
          @update:model-value="setCurrentPage"
        />
      </div>
    </div>
  </div>
</template>
