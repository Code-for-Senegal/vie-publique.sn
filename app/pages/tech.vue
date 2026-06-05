<script setup lang="ts">
const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata();

const title = 'Webinar technique Vie Publique Sénégal';
const description =
  "Participez au webinar technique de Vie Publique Sénégal consacré à l'architecture, l'IA, le DevOps, l'open data et les projets numériques citoyens.";
const url = `${siteUrl}/webinar-tech`;
const image = `${siteUrl}/og-image.png`;

const GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScjH3Gx1lZuBS40TBPUiLAEBtKqsTezqRs2ecjoq9NbcBJp1Q/viewform?embedded=true';

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
    'webinar vie publique sénégal',
    'webinar technique sénégal',
    'architecture web sénégal',
    'intelligence artificielle sénégal',
    'RAG retrieval augmented generation',
    'DevOps sénégal',
    'OCR documents sénégal',
    'open source civic tech',
    'n8n automatisation',
    'open data sénégal',
  ].join(', '),
});

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
      name: 'Webinar Technique',
      item: url,
    },
  ],
};

const eventSchema = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: title,
  description,
  url,
  image,
  eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  location: {
    '@type': 'VirtualLocation',
    url,
  },
  organizer: {
    '@type': 'Organization',
    name: 'Vie Publique Sénégal',
    url: siteUrl,
  },
  inLanguage: 'fr',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'XOF',
    availability: 'https://schema.org/InStock',
    url,
  },
};

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: 'fr_SN' },
    { name: 'robots', content: 'index, follow' },
    { name: 'geo.region', content: 'SN' },
    { name: 'geo.placename', content: 'Dakar' },
  ],
  script: [
    { type: 'application/ld+json', children: JSON.stringify(breadcrumbSchema) },
    { type: 'application/ld+json', children: JSON.stringify(eventSchema) },
  ],
});
</script>

<template>
  <div class="container mx-auto min-h-screen max-w-4xl px-2 md:px-4 py-8 pb-16 ">
    <AppBreadcrumb :items="[{ label: 'Webinar Technique' }]" />

    <!-- Hero -->
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">
        Communauté technique Vie Publique Sénégal
      </h1>
      <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
        Architecture &bull; IA &bull; RAG &bull; DevOps &bull; OCR &bull; Open Source
      </p>
    </div>

    <!-- Description -->
    <p class="mx-auto mb-8 max-w-2xl text-center text-gray-600 dark:text-gray-400">
      Nous préparons nos prochains webinaires et ateliers techniques pour partager nos feedbacks, projets, défis techniques et
      opportunités de contribution. <br />Nous souhaitons mieux connaître les sujets qui vous intéressent et identifier les personnes souhaitant participer à nos prochains webinaires, ateliers, projets et initiatives techniques.
    </p>

    <!-- CTA -->
    <div class="mb-10 text-center">
      <a
        href="#formulaire"
        class="inline-flex items-center gap-2 rounded-lg bg-[#FFD400] px-6 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-yellow-400 active:scale-[0.98]"
      >
        Répondez au formulaire (2 minutes)
        <UIcon name="i-heroicons-arrow-down" class="h-4 w-4" />
      </a>
    </div>

    <!-- Form Section -->
    <section id="formulaire">
      <div class="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <iframe
          :src="GOOGLE_FORM_URL"
          class="w-full rounded-lg"
          width="100%"
          height="900"
          frameborder="0"
          marginheight="0"
          marginwidth="0"
          title="Formulaire d'inscription au webinar technique Vie Publique Sénégal"
          loading="lazy"
        >
          Chargement du formulaire…
        </iframe>
      </div>
    </section>
  </div>
</template>
