<script setup lang="ts">
import type { GovernmentMember } from '~/types/government-member';

const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata();

const title =
  'Gouvernement du Sénégal — Composition actuelle sous Bassirou Diomaye Faye | Vie Publique Sénégal';
const description =
  "Composition actuelle du gouvernement du Sénégal sous la présidence de Bassirou Diomaye Faye. Liste complète des ministres, secrétaires d'État avec photos et fonctions.";
const url = `${siteUrl}/gouvernement-senegal`;
const image = `${siteUrl}/nomination-3.png`;

// Récupération des données du gouvernement
const {
  governmentData,
  primeMinister,
  ministers,
  secretariesOfState,
  stats,
  loading: pending,
  error,
} = useGovernment();

// Schema GovernmentOrganization (réactif)
const governmentSchema = computed(() => {
  const members = [primeMinister.value, ...ministers.value, ...secretariesOfState.value].filter(
    Boolean,
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: 'Gouvernement de la République du Sénégal',
    url,
    description,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'SN',
      addressLocality: 'Dakar',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Sénégal',
    },
    parentOrganization: {
      '@type': 'GovernmentOrganization',
      name: 'République du Sénégal',
    },
    member: members.map((member: GovernmentMember) => ({
      '@type': 'Person',
      name: member.name,
      jobTitle: member.role,
      gender: member.sexe === 'female' ? 'Female' : 'Male',
      image: member.photo ? useCmsImage(member.photo) : undefined,
      worksFor: {
        '@type': 'GovernmentOrganization',
        name: 'Gouvernement du Sénégal',
      },
    })),
  };
});

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description,
  url,
  image,
  isPartOf: {
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
  },
  about: [
    {
      '@type': 'GovernmentOrganization',
      name: 'Gouvernement du Sénégal',
    },
  ],
  mainEntity: {
    '@type': 'ItemList',
    name: 'Membres du gouvernement du Sénégal',
    description: "Premier Ministre, ministres et secrétaires d'État du Sénégal",
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
      name: 'Annuaires',
      item: `${siteUrl}/annuaires`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Gouvernement du Sénégal',
      item: url,
    },
  ],
};

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
    'gouvernement sénégal',
    'gouvernement actuel sénégal',
    'ministres sénégal',
    'premier ministre sénégal',
    'Ousmane Sonko',
    'Bassirou Diomaye Faye',
    'cabinet ministériel sénégal',
    'composition gouvernement sénégal',
    "secrétaires d'état sénégal",
    'gouvernement Diomaye Faye',
    'liste ministres sénégal',
  ].join(', '),
});

// Head Configuration
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
      children: JSON.stringify(pageSchema),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbSchema),
    },
    {
      type: 'application/ld+json',
      children: computed(() => JSON.stringify(governmentSchema.value)),
    },
  ],
});

// URL vers la fiche détail (avec ref=gouvernement pour le retour)
const getPortraitUrl = (member: GovernmentMember) => {
  const slug = member.slug || member.id;
  return `/personnalites/${member.id}/${slug}?ref=gouvernement`;
};

// Durée en fonction
const getDuration = (nominationDate: string): string => {
  const start = new Date(nominationDate);
  const now = new Date();
  const months = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));

  if (months < 1) return 'Récemment nommé(e)';
  if (months < 12) return `${months} mois en fonction`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} an${years > 1 ? 's' : ''} en fonction`;
  return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <!-- Breadcrumb -->
    <div class="container mx-auto px-4 pt-2">
      <AppBreadcrumb
        :items="[{ label: 'Annuaires', to: '/annuaires' }, { label: 'Gouvernement' }]"
      />
    </div>

    <!-- SEO hidden heading -->
    <h1 class="sr-only">
      Gouvernement du Sénégal — Composition actuelle, ministres et secrétaires d'État
    </h1>

    <!-- Sticky Header -->
    <header
      class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95"
    >
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
              Gouvernement du Sénégal
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Présidence de Bassirou Diomaye Faye
            </p>
          </div>
          <!-- Stats desktop -->
          <div v-if="stats" class="hidden items-center gap-3 sm:flex">
            <span
              class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {{ stats.total }} membres
            </span>
            <span
              class="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
            >
              {{ stats.women }} femmes · {{ Math.round((stats.women / stats.total) * 100) }}%
            </span>
          </div>
        </div>
        <!-- Stats mobile -->
        <div v-if="stats" class="mt-2 flex items-center gap-2 sm:hidden">
          <span
            class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          >
            {{ stats.total }} membres
          </span>
          <span
            class="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-600 dark:bg-purple-900/30 dark:text-purple-300"
          >
            {{ stats.women }} femmes · {{ Math.round((stats.women / stats.total) * 100) }}%
          </span>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 pt-6">
      <!-- Loading -->
      <div v-if="pending" class="space-y-8">
        <div>
          <div class="mb-4 h-5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
          <div class="h-48 overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-700 sm:h-56" />
        </div>
        <div>
          <div class="mb-4 h-5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <div v-for="n in 10" :key="n" class="overflow-hidden rounded-xl">
              <USkeleton class="aspect-[3/4] w-full" />
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="py-12 text-center">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
        >
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="h-8 w-8 text-red-600 dark:text-red-400"
          />
        </div>
        <p class="text-sm font-medium text-gray-900 dark:text-white">Erreur de chargement</p>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Impossible de charger le gouvernement
        </p>
        <UButton color="red" variant="soft" size="sm" class="mt-4" @click="$router.go(0)">
          Réessayer
        </UButton>
      </div>

      <!-- Contenu -->
      <div v-else-if="governmentData" class="space-y-10">
        <!-- Premier Ministre -->
        <section v-if="primeMinister">
          <h2 class="mb-4 text-lg font-bold text-gray-900 dark:text-white">Premier Ministre</h2>

          <NuxtLink
            :to="getPortraitUrl(primeMinister)"
            class="group relative block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-xl dark:bg-gray-900 dark:ring-gray-700"
          >
            <div class="flex flex-col sm:flex-row">
              <!-- Photo PM -->
              <div
                class="relative aspect-square w-full shrink-0 overflow-hidden bg-gray-200 dark:bg-gray-800 sm:aspect-auto sm:h-56 sm:w-44 md:h-64 md:w-52"
              >
                <img
                  :src="
                    primeMinister.photo ? useCmsImage(primeMinister.photo) : '/unknown_member.webp'
                  "
                  :alt="primeMinister.name"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <!-- Gradient mobile only -->
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent sm:hidden"
                />
                <!-- Info mobile overlay -->
                <div class="absolute inset-x-0 bottom-0 p-4 sm:hidden">
                  <h3 class="text-lg font-bold text-white">{{ primeMinister.name }}</h3>
                  <p class="mt-0.5 text-sm text-white/80">{{ primeMinister.role }}</p>
                </div>
              </div>
              <!-- Info desktop -->
              <div class="hidden flex-1 flex-col justify-center p-6 sm:flex md:p-8">
                <div
                  class="mb-2 inline-flex w-fit items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                >
                  Premier Ministre
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
                  {{ primeMinister.name }}
                </h3>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {{ primeMinister.role }}
                </p>
                <p
                  v-if="primeMinister.nominationDate"
                  class="mt-3 text-xs text-gray-500 dark:text-gray-500"
                >
                  {{ getDuration(primeMinister.nominationDate) }}
                </p>
              </div>
              <!-- Arrow desktop -->
              <div class="hidden items-center pr-6 sm:flex">
                <UIcon
                  name="i-heroicons-chevron-right-20-solid"
                  class="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-gray-500 dark:text-gray-600"
                />
              </div>
            </div>
          </NuxtLink>
        </section>

        <!-- Ministres -->
        <section v-if="ministers.length > 0">
          <h2 class="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            Ministres ({{ ministers.length }})
          </h2>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <NuxtLink
              v-for="minister in ministers"
              :key="minister.id"
              :to="getPortraitUrl(minister)"
              class="group relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-200 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-lg hover:ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 dark:hover:ring-gray-600"
            >
              <img
                :src="minister.photo ? useCmsImage(minister.photo) : '/unknown_member.webp'"
                :alt="minister.name"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
              />
              <div class="absolute inset-x-0 bottom-0 p-3">
                <h3 class="text-sm font-bold leading-tight text-white">
                  {{ minister.name }}
                </h3>
                <p class="mt-0.5 line-clamp-2 text-[11px] leading-tight text-white/80">
                  {{ minister.role }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- Secrétaires d'État -->
        <section v-if="secretariesOfState.length > 0">
          <h2 class="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            Secrétaires d'État ({{ secretariesOfState.length }})
          </h2>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <NuxtLink
              v-for="secretary in secretariesOfState"
              :key="secretary.id"
              :to="getPortraitUrl(secretary)"
              class="group relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-200 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-lg hover:ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 dark:hover:ring-gray-600"
            >
              <img
                :src="secretary.photo ? useCmsImage(secretary.photo) : '/unknown_member.webp'"
                :alt="secretary.name"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
              />
              <div class="absolute inset-x-0 bottom-0 p-3">
                <h3 class="text-sm font-bold leading-tight text-white">
                  {{ secretary.name }}
                </h3>
                <p class="mt-0.5 line-clamp-2 text-[11px] leading-tight text-white/80">
                  {{ secretary.role }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- Lien vers l'annuaire -->
        <div class="border-t border-gray-200 pt-6 dark:border-gray-800">
          <NuxtLink
            to="/personnalites-senegal"
            class="text-primary-600 hover:text-primary-700 dark:text-primary-400 inline-flex items-center gap-2 text-sm font-medium"
          >
            Voir l'annuaire des personnalités publiques
            <UIcon name="i-heroicons-arrow-right-20-solid" class="h-4 w-4" />
          </NuxtLink>
        </div>
      </div>
    </main>

    <!-- Note -->
    <div class="container mx-auto mt-8 px-4 text-center text-xs text-gray-400 dark:text-gray-500">
      <p>Source : Décrets présidentiels de la République du Sénégal</p>
    </div>

    <ScrollToTopButton />
  </div>
</template>
