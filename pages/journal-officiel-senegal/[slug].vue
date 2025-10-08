<script setup lang="ts">
const { siteName, siteUrl, defaultImage, keywords, themeColor } =
  useSiteMetadata();
const route = useRoute();

// Utilisation du composable useDocuments pour les détails
const documentId = computed(() => route.params.id as string);

const {
  document: journal,
  loading,
  error,
} = useDocuments({
  id: documentId.value,
});

const links = [{ label: "Journaux", to: "/journal-officiel-senegal" }];

const title = computed(() => {
  if (!journal.value) return "Chargement...";
  return `${journal.value.title} | Journal Officiel Sénégal`;
});

const description = computed(() => {
  if (!journal.value) return "";
  return (
    journal.value.description ||
    `Numéro du Journal Officiel de la République du Sénégal - ${journal.value.title}`
  );
});

const url = computed(() => {
  if (!route.params.slug) return siteUrl;
  return `${siteUrl}/documents/journal-officiel/${route.params.slug}`;
});

const image = computed(() => {
  return `${siteUrl}/images/vpsn-share-jors-4.png`;
});

const pdfUrl = computed(() => {
  if (!journal.value?.file) return "";
  return useCmsFile(journal.value.file.id);
});

const publicationIssueSchema = computed(() => {
  if (!journal.value) return null;

  return {
    "@context": "https://schema.org",
    "@type": "PublicationIssue",
    name: journal.value.title,
    description: description.value,
    url: url.value,
    datePublished: journal.value.publish_date || journal.value.date_created,
    issueNumber: journal.value.jo_number || undefined,
    pageStart: "1",
    inLanguage: "fr-SN",
    isPartOf: {
      "@type": "Periodical",
      name: "Journal Officiel de la République du Sénégal",
      issn: "0851-8025",
      publisher: {
        "@type": "GovernmentOrganization",
        name: "République du Sénégal",
      },
    },
    publisher: {
      "@type": "GovernmentOrganization",
      name: "République du Sénégal",
    },
    author: {
      "@type": "GovernmentOrganization",
      name: "République du Sénégal",
    },
    genre: "Official publication",
    keywords: [
      "Journal Officiel",
      "JORS",
      "République du Sénégal",
      "textes officiels",
    ],
  };
});

const breadcrumbSchema = computed(() => ({
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
      item: `${siteUrl}/documents/journal-officiel`,
    },
    {
      "@type": "ListItem",
      position: 4,
      name: journal.value?.title || "Numéro",
      item: url.value,
    },
  ],
}));

const digitalDocumentSchema = computed(() => {
  if (!journal.value?.file) return null;

  return {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: journal.value.title,
    description: description.value,
    url: pdfUrl.value,
    encodingFormat: "application/pdf",
    datePublished: journal.value.publish_date || journal.value.date_created,
    inLanguage: "fr-SN",
    isAccessibleForFree: true,
    creator: {
      "@type": "GovernmentOrganization",
      name: "République du Sénégal",
    },
    publisher: {
      "@type": "GovernmentOrganization",
      name: "République du Sénégal",
    },
    genre: "Legal document",
    audience: {
      "@type": "Audience",
      audienceType: "General public",
    },
  };
});

const webPageSchema = computed(() => {
  if (!journal.value) return null;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title.value,
    description: description.value,
    url: url.value,
    image: image.value,
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
    },
    about: {
      "@type": "GovernmentOrganization",
      name: "République du Sénégal",
    },
    mainEntity: publicationIssueSchema.value,
  };
});

// SEO setup
watchEffect(() => {
  if (journal.value) {
    // SEO Meta Tags
    useSeoMeta({
      title: title.value,
      ogTitle: title.value,
      description: description.value,
      ogDescription: description.value,
      ogImage: image.value,
      ogUrl: url.value,
      twitterCard: "summary_large_image",
      twitterTitle: title.value,
      twitterDescription: description.value,
      twitterImage: image.value,
      keywords: [
        ...keywords,
        "Journal Officiel Sénégal",
        "JORS",
        journal.value.title,
        journal.value.jo_number ? `numéro ${journal.value.jo_number}` : "",
        "textes officiels",
        "République du Sénégal",
      ]
        .filter(Boolean)
        .join(", "),
    });

    // Head Configuration
    useHead({
      htmlAttrs: { lang: "fr-SN" },
      link: [
        { rel: "canonical", href: url.value },
        journal.value.file
          ? {
              rel: "alternate",
              type: "application/pdf",
              href: pdfUrl.value,
            }
          : null,
      ].filter(Boolean),
      meta: [
        { name: "theme-color", content: themeColor },
        { name: "author", content: "République du Sénégal" },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: siteName },
        {
          property: "article:published_time",
          content: journal.value.publish_date || journal.value.date_created,
        },
        { property: "article:author", content: "République du Sénégal" },
        { property: "article:section", content: "Journal Officiel" },
        { name: "robots", content: "index, follow" },
        { name: "geo.region", content: "SN" },
        { name: "geo.placename", content: "Dakar" },
        { name: "geo.position", content: "14.7645042;-17.3660286" },
        { name: "ICBM", content: "14.7645042, -17.3660286" },
        { name: "DC.type", content: "Text" },
        { name: "DC.format", content: "text/html" },
        { name: "DC.language", content: "fr-SN" },
        { name: "DC.coverage", content: "Sénégal" },
        { name: "DC.subject", content: "Journal Officiel, Législation" },
      ],
      script: [
        publicationIssueSchema.value
          ? {
              type: "application/ld+json",
              children: JSON.stringify(publicationIssueSchema.value),
            }
          : null,
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbSchema.value),
        },
        digitalDocumentSchema.value
          ? {
              type: "application/ld+json",
              children: JSON.stringify(digitalDocumentSchema.value),
            }
          : null,
        webPageSchema.value
          ? {
              type: "application/ld+json",
              children: JSON.stringify(webPageSchema.value),
            }
          : null,
      ].filter(Boolean),
    });
  }
});

// Recharger les données si l'ID change
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await refreshNuxtData(`document-${newId}`);
    }
  },
);

// Fonction pour obtenir l'URL de l'asset via le nouveau proxy
const getAssetUrl = (assetId: string) => {
  return useCmsFile(assetId);
};

const formatDateISO = (date: string) => {
  return new Date(date).toISOString();
};
</script>

<template>
  <div itemscope itemtype="https://schema.org/WebPage">
    <AppBreadcrumb :links="links" :last-text="route.params.slug" />

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-8">
      <UProgress color="blue" />
      <p class="mt-4">Chargement des journaux officiels...</p>
    </div>

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      title="Erreur"
      description="Une erreur s'est produite lors du chargement du journal officiel."
      color="red"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Contenu -->
    <article
      v-else-if="journal"
      class="prose prose-sm sm:prose mx-auto"
      itemscope
      itemtype="https://schema.org/PublicationIssue"
      itemprop="mainEntity"
    >
      <!-- Schema.org hidden metadata -->
      <meta itemprop="url" :content="url" />
      <meta
        itemprop="datePublished"
        :content="formatDateISO(journal.publish_date || journal.date_created)"
      />
      <meta itemprop="issueNumber" :content="journal.jo_number || ''" />
      <meta itemprop="inLanguage" content="fr-SN" />
      <meta itemprop="genre" content="Official publication" />

      <!-- Publisher info -->
      <div
        itemprop="publisher"
        itemscope
        itemtype="https://schema.org/GovernmentOrganization"
      >
        <meta itemprop="name" content="République du Sénégal" />
      </div>

      <!-- Author info -->
      <div
        itemprop="author"
        itemscope
        itemtype="https://schema.org/GovernmentOrganization"
      >
        <meta itemprop="name" content="République du Sénégal" />
      </div>

      <!-- Part of periodical -->
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

        <div
          itemprop="publisher"
          itemscope
          itemtype="https://schema.org/GovernmentOrganization"
        >
          <meta itemprop="name" content="République du Sénégal" />
        </div>
      </div>

      <h1 class="dark:text-white" itemprop="headline">
        {{ journal.title }}
      </h1>

      <!-- PDF Download link -->
      <div v-if="journal.file" class="my-4">
        <div
          itemprop="encoding"
          itemscope
          itemtype="https://schema.org/DigitalDocument"
        >
          <meta itemprop="encodingFormat" content="application/pdf" />
          <meta itemprop="url" :content="getAssetUrl(journal.file.id)" />
          <meta itemprop="isAccessibleForFree" content="true" />

          <a
            :href="getAssetUrl(journal.file.id)"
            target="_blank"
            class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
            itemprop="url"
          >
            📄 Télécharger le PDF
          </a>
        </div>
      </div>

      <!-- Description -->
      <div
        v-if="journal.description"
        itemprop="description"
        class="mb-4 italic text-gray-600"
      >
        {{ journal.description }}
      </div>

      <!-- Contenu HTML -->
      <div itemprop="text" v-html="journal.content_html"></div>

      <ClientOnly placeholder="Chargement en cours">
        <embed
          :src="getAssetUrl(journal.file.id)"
          type="application/pdf"
          width="100%"
          height="700px"
        />
      </ClientOnly>

      <!-- Keywords -->
      <meta
        itemprop="keywords"
        content="Journal Officiel, JORS, République du Sénégal, textes officiels"
      />
    </article>

    <!-- Not found state -->
    <div v-else class="py-8 text-center text-gray-500">
      Journal officiel non trouvé
    </div>

    <ScrollToTopButton />
  </div>
</template>

<style>
.prose p a {
  color: rgb(37 99 235);
}
</style>
