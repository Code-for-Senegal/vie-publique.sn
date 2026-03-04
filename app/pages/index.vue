<script setup lang="ts">
import HomeFeaturedDocuments from '~/components/HomeFeaturedDocuments.vue';

const { siteName, siteUrl, defaultTitle, defaultDescription, defaultImage, keywords, themeColor } =
  useSiteMetadata();

useSeoMeta({
  title: defaultTitle,
  ogTitle: defaultTitle,
  description: defaultDescription,
  ogDescription: defaultDescription,
  ogImage: defaultImage,
  ogUrl: siteUrl,
  twitterCard: 'summary_large_image',
  twitterTitle: defaultTitle,
  twitterDescription: defaultDescription,
  twitterImage: defaultImage,
  keywords: [
    ...keywords,
    'lois décrets Sénégal',
    'codes juridiques Sénégal',
    'rapports audit Sénégal',
  ].join(', '),
});

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteName,
  url: siteUrl,
  logo: defaultImage,
  description: defaultDescription,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'SN',
    addressLocality: 'Dakar',
    addressRegion: 'Dakar',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Sénégal',
    identifier: 'SN',
  },
  knowsAbout: [
    'Journal officiel du Sénégal',
    'Lois et décrets sénégalais',
    'Codes juridiques du Sénégal',
    'Budget du Sénégal',
    'Assemblée nationale du Sénégal',
    'Rapports OFNAC',
    'Cour des Comptes du Sénégal',
    'IGE',
    'CENTIF',
    'ARMP',
    'Conseil des ministres du Sénégal',
    'Nominations gouvernementales',
  ],
  sameAs: ['https://twitter.com/viepubliquesn'],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
  url: siteUrl,
  description: defaultDescription,
  inLanguage: 'fr-SN',
  isAccessibleForFree: true,
  copyrightYear: new Date().getFullYear(),
  publisher: {
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    logo: defaultImage,
  },
  mainEntity: {
    '@type': 'GovernmentOrganization',
    name: 'République du Sénégal',
  },
  about: [
    {
      '@type': 'Thing',
      name: 'Politique sénégalaise',
    },
    {
      '@type': 'Thing',
      name: 'Institutions démocratiques',
    },
    {
      '@type': 'Thing',
      name: 'Transparence gouvernementale',
    },
  ],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/recherche?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
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
  ],
};

const newsMediaSchema = {
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
  foundingDate: '2020',
  missionCoveragePrioritiesPolicy: `${siteUrl}/a-propos/qui-sommes-nous`,
};

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: siteUrl }],
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
      children: JSON.stringify(organizationSchema),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(websiteSchema),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbSchema),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(newsMediaSchema),
    },
  ],
});

// Utilisation du composable centralisé pour les données de navigation
const { navigationCards } = useNavigationCards();
</script>

<template>
  <div class="container mx-auto p-2 sm:p-4">
    <div class="py-4 text-center">
      <h1 class="text-2xl font-light leading-tight text-gray-900 dark:text-white md:text-4xl">
        Accès facilité à<br /><span class="font-medium text-gray-700 dark:text-gray-300"
          >l'information publique au Sénégal</span
        >
      </h1>
    </div>

    <HomeSearchSection />

    <HomeQuickAccess :navigation-cards="navigationCards" />

    <div class="">
      <div class="my-8">
        <HomeFeaturedDocuments />
      </div>
      <div class="my-8">
        <HomePodcasts />
      </div>
      <div class="my-8">
        <HomeBudgetHighlight />
      </div>
      <div class="my-8">
        <HomeNews />
      </div>
      <div class="my-8">
        <HomeAssemblyQuestions />
      </div>

      <div class="my-8">
        <HomeSocialNetworks />
      </div>
      <div class="my-8 hidden">
        <HomeWhatsAppChannel />
      </div>
      <div class="my-8">
        <PartnersSection />
      </div>

      <UDivider site="sm" class="mt-4" />

      <div class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400 sm:px-8">
        🛈 Vie-Publique est tenu par des bénévoles <br />
        si vous voyez une erreur merci de nous aider à corriger
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.5rem;
}
</style>
