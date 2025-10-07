<script setup lang="ts">
const { siteName, siteUrl, defaultImage, keywords, themeColor } =
  useSiteMetadata();
const collection = useCollection();

const title = "Journal Officiel de la République du Sénégal | Vie-Publique.sn";
const description =
  "Consultez tous les numéros du Journal Officiel de la République du Sénégal. Lois, décrets, arrêtés et textes officiels publiés au JORS.";
const url = `${siteUrl}/documents/journal-officiel`;
const image = `${siteUrl}/images/vpsn-share-jors-4.png`;

// Schema.org
const journalOfficielSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: title,
  description: description,
  url: url,
  image: image,
  isPartOf: {
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  },
  about: {
    "@type": "GovernmentOrganization",
    name: "République du Sénégal",
  },
  mainEntity: {
    "@type": "Periodical",
    name: "Journal Officiel de la République du Sénégal",
    alternateName: "JORS",
    description:
      "Publication officielle de la République du Sénégal contenant les lois, décrets et arrêtés",
    publisher: {
      "@type": "GovernmentOrganization",
      name: "République du Sénégal",
    },
    issn: "0851-8025",
    inLanguage: "fr-SN",
    frequency: "Weekly",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Accueil",
      item: siteUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Documents",
      item: `${siteUrl}/documents`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Journal Officiel",
      item: url,
    },
  ],
};

const datasetSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Archives du Journal Officiel du Sénégal",
  description:
    "Collection complète des numéros du Journal Officiel de la République du Sénégal",
  url: url,
  keywords: [
    "Journal Officiel",
    "JORS",
    "lois",
    "décrets",
    "arrêtés",
    "Sénégal",
    "textes officiels",
  ],
  creator: {
    "@type": "GovernmentOrganization",
    name: "République du Sénégal",
  },
  publisher: {
    "@type": "Organization",
    name: siteName,
  },
  license: "https://creativecommons.org/publicdomain/mark/1.0/",
  isAccessibleForFree: true,
  inLanguage: "fr-SN",
};

const periodicalSchema = {
  "@context": "https://schema.org",
  "@type": "GovernmentService",
  name: "Service de publication du Journal Officiel",
  description:
    "Service gouvernemental de publication des textes officiels au Journal Officiel",
  provider: {
    "@type": "GovernmentOrganization",
    name: "République du Sénégal",
  },
  areaServed: {
    "@type": "Country",
    name: "Sénégal",
  },
  serviceType: "Publication officielle",
  audience: {
    "@type": "Audience",
    audienceType: "Citizens, Legal professionals, Researchers",
  },
};

// Utilisation de useAsyncData pour le SSR
const {
  data: documentsData,
  pending: loading,
  error,
} = useAsyncData("journal-officiel-list", async () => {
  const response = await collection.fetchDocuments({
    type: "official_journal",
  });
  return response;
});

// Computed pour les documents
const documents = computed(() => documentsData.value?.documents || []);

const searchQuery = ref("");
const router = useRouter();

const filteredJournals = computed(() => {
  if (!documents.value) return [];

  return documents.value.filter((doc) => {
    const searchLower = searchQuery.value.toLowerCase();
    return (
      doc.title?.toLowerCase().includes(searchLower) ||
      doc.jo_number?.toString().toLowerCase().includes(searchLower) ||
      doc.description?.toLowerCase().includes(searchLower)
    );
  });
});

// Format de la date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatDateISO = (date: string) => {
  return new Date(date).toISOString();
};

// SEO
useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: image,
  ogUrl: url,
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  keywords: [
    ...keywords,
    "Journal Officiel Sénégal",
    "JORS",
    "lois Sénégal",
    "décrets sénégalais",
    "arrêtés officiels",
    "textes législatifs Sénégal",
    "publication officielle",
    "République du Sénégal",
  ].join(", "),
});

useHead({
  htmlAttrs: { lang: "fr-SN" },
  link: [{ rel: "canonical", href: url }],
  meta: [
    { name: "theme-color", content: themeColor },
    { name: "author", content: "République du Sénégal" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { name: "robots", content: "index, follow" },
    { name: "geo.region", content: "SN" },
    { name: "geo.placename", content: "Dakar" },
    { name: "geo.position", content: "14.7645042;-17.3660286" },
    { name: "ICBM", content: "14.7645042, -17.3660286" },
    { name: "DC.type", content: "Collection" },
    { name: "DC.format", content: "text/html" },
    { name: "DC.language", content: "fr-SN" },
    { name: "DC.coverage", content: "Sénégal" },
    {
      name: "DC.subject",
      content: "Journal Officiel, Législation, Gouvernement",
    },
  ],
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify(journalOfficielSchema),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(breadcrumbSchema),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(datasetSchema),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(periodicalSchema),
    },
  ],
});
</script>

<template>
  <div
    class="container mx-auto px-4"
    itemscope
    itemtype="https://schema.org/CollectionPage"
  >
    <!-- Bouton retour -->
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      label="Retour"
      color="gray"
      @click="router.back()"
    />

    <!-- En-tête -->
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1
        class="text-center text-xl text-gray-900 sm:text-2xl"
        itemprop="headline"
      >
        Journal Officiel
      </h1>
    </div>

    <!-- Schema.org hidden metadata -->
    <div
      itemprop="mainEntity"
      itemscope
      itemtype="https://schema.org/Periodical"
    >
      <meta
        itemprop="name"
        content="Journal Officiel de la République du Sénégal"
      />
      <meta itemprop="alternateName" content="JORS" />
      <meta itemprop="issn" content="0851-8025" />
      <meta itemprop="inLanguage" content="fr-SN" />
      <meta itemprop="frequency" content="Weekly" />

      <div
        itemprop="publisher"
        itemscope
        itemtype="https://schema.org/GovernmentOrganization"
      >
        <meta itemprop="name" content="République du Sénégal" />
      </div>
    </div>

    <!-- Recherche -->
    <div class="mb-8">
      <UInput
        v-model="searchQuery"
        size="lg"
        placeholder="Rechercher par numéro, date ou contenu..."
        icon="i-heroicons-magnifying-glass"
        class="custom-shadow sm:w-full"
      />
      <div
        class="mt-2 flex flex-col items-center justify-between text-sm text-gray-500 sm:flex-row"
      >
        <span>{{ filteredJournals.length }} Journaux référencés</span>
      </div>
    </div>

    <!-- Loading state -->
    <template v-if="loading">
      <UCard v-for="n in 3" :key="n" class="mb-4">
        <div class="flex items-start gap-4 p-4">
          <div class="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          <div class="flex-grow">
            <div class="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200" />
            <div class="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </UCard>
    </template>

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      title="Erreur"
      description="Une erreur s'est produite lors du chargement des journaux."
      color="red"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Résultats vides -->
    <UAlert
      v-else-if="filteredJournals.length === 0"
      title="Aucun résultat"
      description="Aucun journal officiel ne correspond à votre recherche."
      color="gray"
      icon="i-heroicons-inbox"
    />

    <!-- Liste des journaux -->
    <div
      v-else
      class="space-y-4"
      itemscope
      itemtype="https://schema.org/ItemList"
    >
      <meta itemprop="numberOfItems" :content="`${filteredJournals.length}`" />

      <article
        v-for="(journal, index) in filteredJournals"
        :key="journal.id"
        itemscope
        itemtype="https://schema.org/PublicationIssue"
        itemprop="itemListElement"
        class="rounded-none transition-shadow duration-200 hover:shadow-lg"
      >
        <meta itemprop="position" :content="`${index + 1}`" />
        <meta
          itemprop="url"
          :content="`${siteUrl}/documents/${journal.id}/${journal.slug || 'journal-officiel'}`"
        />
        <meta
          itemprop="datePublished"
          :content="formatDateISO(journal.publish_date)"
        />
        <meta itemprop="issueNumber" :content="journal.jo_number || ''" />

        <div
          itemprop="isPartOf"
          itemscope
          itemtype="https://schema.org/Periodical"
        >
          <meta
            itemprop="name"
            content="Journal Officiel de la République du Sénégal"
          />
          <meta itemprop="issn" content="0851-8025" />
        </div>

        <UCard :ui="{ body: { padding: 'sm:p-4' } }">
          <NuxtLink
            :to="`/documents/${journal.id}/${journal.slug || 'journal-officiel'}`"
            class="block"
            itemprop="url"
          >
            <div class="flex gap-4">
              <div
                class="w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
                itemprop="image"
                itemscope
                itemtype="https://schema.org/ImageObject"
              >
                <img
                  src="/images/default-journal-officiel.webp"
                  :alt="`Aperçu JO ${journal.jo_number || ''}`"
                  class="h-full w-full object-cover"
                  loading="lazy"
                  fetchpriority="high"
                  itemprop="contentUrl"
                />
                <meta
                  itemprop="url"
                  content="/images/default-journal-officiel.webp"
                />
              </div>

              <div>
                <div class="flex items-start justify-between gap-4">
                  <h3 class="text-primary font-semibold" itemprop="headline">
                    {{ journal.title }}
                  </h3>
                </div>

                <p class="mt-2 text-sm text-gray-600" itemprop="description">
                  {{ journal.description }}
                </p>

                <div class="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <UIcon name="i-heroicons-calendar" />
                  <time
                    :datetime="formatDateISO(journal.publish_date)"
                    itemprop="datePublished"
                  >
                    {{ formatDate(journal.publish_date) }}
                  </time>
                </div>

                <!-- Additional metadata -->
                <meta itemprop="name" :content="journal.title" />
                <div
                  itemprop="publisher"
                  itemscope
                  itemtype="https://schema.org/GovernmentOrganization"
                >
                  <meta itemprop="name" content="République du Sénégal" />
                </div>
              </div>
            </div>
          </NuxtLink>
        </UCard>
      </article>
    </div>
  </div>
</template>
