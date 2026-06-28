<script setup lang="ts">
const { siteName, siteUrl, themeColor, keywords } = useSiteMetadata();

const pageTitle = 'État du Sénégal : institutions, organisation et budget';
const pageDescription =
  "Comprenez l'État du Sénégal : les institutions de la République, l'organisation administrative (ministères, directions, agences), le gouvernement en place et le budget national. Des données officielles rendues claires et accessibles.";
const pageUrl = `${siteUrl}/etat-senegal`;
const ogImage = `${siteUrl}/nomination-3.png`;

const documentCategories = [
  {
    title: "Organisation de l'État",
    description: "Répartition des services de l'État",
    icon: 'i-heroicons-puzzle-piece',
    to: '/etat-senegal/organisation',
    display: true,
    color: 'bg-green-100 text-green-700',
  },
  {
    title: 'Institutions de la république',
    description: 'Présentation des institutions de la république',
    icon: 'i-heroicons-building-library',
    to: '/etat-senegal/institutions',
    display: true,
    color: 'bg-green-100 text-green-700',
  },
  {
    title: 'Gouvernement du Sénégal',
    description: 'Composition du gouvernement actuel',
    icon: 'i-heroicons-building-office',
    to: '/gouvernement-senegal',
    display: true,
    featureKey: 'menu_gouvernement',
    color: 'bg-green-100 text-green-700',
  },
  {
    title: "Budget de l'État",
    description:
      "les chiffres clés du budget 2024, Loi de finance, Rapport d'execution trimestriel",
    icon: 'i-heroicons-banknotes',
    to: '/budget-senegal',
    display: true,
    color: 'bg-yellow-100 text-yellow-700',
  },
];

// ── SEO ───────────────────────────────────────────────────────────
useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  description: pageDescription,
  ogDescription: pageDescription,
  ogImage,
  ogUrl: pageUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: ogImage,
  keywords: [
    ...keywords,
    'État du Sénégal',
    'institutions du Sénégal',
    'organisation administrative Sénégal',
    'gouvernement du Sénégal',
    "budget de l'État Sénégal",
    'République du Sénégal',
  ].join(', '),
});

// Nœud d'entité propre à la page (le BreadcrumbList est émis par <AppBreadcrumb>).
const collectionPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: pageTitle,
  description: pageDescription,
  url: pageUrl,
  inLanguage: 'fr-SN',
  isPartOf: { '@type': 'WebSite', name: siteName, url: siteUrl },
  about: {
    '@type': 'GovernmentOrganization',
    name: 'République du Sénégal',
    url: 'https://www.gouv.sn',
  },
};

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: pageUrl }],
  meta: [
    { name: 'robots', content: 'index, follow' },
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: 'fr_SN' },
  ],
  script: [
    {
      key: 'ld-collectionpage',
      type: 'application/ld+json',
      innerHTML: JSON.stringify(collectionPageSchema),
    },
  ],
});
</script>

<template>
  <div class="min-h-screen pb-16">
    <AppBreadcrumb :items="[{ label: 'État du Sénégal' }]" class="px-4" />

    <!-- ─── Hero éditorial (H1 unique + intro) ──────────────────────── -->
    <section class="mx-auto mt-4 max-w-3xl px-4">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
        L'État du Sénégal
      </h1>
      <p class="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400 md:text-base">
        Comprendre comment fonctionne l'État du Sénégal : les
        <strong class="font-semibold text-gray-800 dark:text-gray-200"
          >institutions de la République</strong
        >, l'<strong class="font-semibold text-gray-800 dark:text-gray-200"
          >organisation administrative</strong
        >
        (ministères, directions, agences et établissements publics), la composition du
        <strong class="font-semibold text-gray-800 dark:text-gray-200">gouvernement</strong>
        et le
        <strong class="font-semibold text-gray-800 dark:text-gray-200">budget national</strong>. Des
        données officielles rassemblées et rendues lisibles pour tous les citoyens.
      </p>
    </section>

    <!-- ─── Grille des rubriques ────────────────────────────────────── -->
    <section class="mx-auto mt-8 max-w-3xl px-4">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <UCard
          v-for="menu in documentCategories"
          :key="menu.title"
          class="custom-shadow p-0 hover:shadow-xl sm:p-0"
        >
          <NuxtLink :to="menu.to" class="flex items-start">
            <div class="mr-4 flex-shrink-0">
              <div :class="['flex h-10 w-10 items-center justify-center rounded-full', menu.color]">
                <UIcon :name="menu.icon" class="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 class="font-bold text-gray-900 dark:text-white">{{ menu.title }}</h2>
              <p v-if="menu.description" class="text-sm text-gray-600 dark:text-gray-400">
                {{ menu.description }}
              </p>
            </div>
          </NuxtLink>
        </UCard>
      </div>
    </section>
  </div>
</template>
