<script setup lang="ts">
import { useNews } from "~/composables/news/useNews";

const { siteName, siteUrl, defaultImage, keywords, themeColor } =
  useSiteMetadata();

const title = "Conseil des ministres du Sénégal | Communiqués officiels";
const description =
  "Suivez les communiqués du Conseil des ministres du gouvernement sénégalais. Décisions, nominations et orientations du gouvernement du Sénégal.";
const url = `${siteUrl}/conseil-des-ministres`;
const image = `${siteUrl}/images/share-conseil-des-ministres-nomination-full.jfif`;

const conseilMinistresSchema = {
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
    name: "Conseil des ministres du Sénégal",
    description:
      "Organe exécutif du gouvernement sénégalais présidé par le Président de la République",
    parentOrganization: {
      "@type": "GovernmentOrganization",
      name: "République du Sénégal",
    },
  },
  mainEntity: {
    "@type": "ItemList",
    name: "Communiqués du Conseil des ministres",
    description:
      "Collection des communiqués officiels du Conseil des ministres du Sénégal",
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
      name: "Conseil des ministres",
      item: url,
    },
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "GovernmentOrganization",
  name: "Conseil des ministres du Sénégal",
  url: url,
  description:
    "Conseil des ministres de la République du Sénégal, organe principal du pouvoir exécutif",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Palais de la République",
    addressLocality: "Dakar",
    addressCountry: "SN",
  },
  areaServed: {
    "@type": "Country",
    name: "Sénégal",
  },
  parentOrganization: {
    "@type": "GovernmentOrganization",
    name: "République du Sénégal",
  },
  leader: {
    "@type": "Person",
    name: "Bassirou Diomaye Faye",
    jobTitle: "Président de la République du Sénégal",
  },
};

const governmentServiceSchema = {
  "@context": "https://schema.org",
  "@type": "GovernmentService",
  name: "Service de communication du Conseil des ministres",
  description:
    "Service de publication des communiqués et décisions du Conseil des ministres",
  provider: {
    "@type": "GovernmentOrganization",
    name: "Conseil des ministres du Sénégal",
  },
  areaServed: {
    "@type": "Country",
    name: "Sénégal",
  },
  serviceType: "Communication gouvernementale",
  audience: {
    "@type": "Audience",
    audienceType: "Citizens, Media, Public officials",
  },
};

// SEO Meta Tags
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
    "Conseil des ministres Sénégal",
    "communiqué conseil des ministres",
    "gouvernement Sénégal",
    "décisions gouvernementales",
    "nominations gouvernement Sénégal",
    "Bassirou Diomaye Faye",
    "Ousmane Sonko",
    "politique sénégalaise",
  ].join(", "),
});

useHead({
  htmlAttrs: { lang: "fr-SN" },
  link: [{ rel: "canonical", href: url }],
  meta: [
    { name: "theme-color", content: themeColor },
    { name: "author", content: "Conseil des ministres du Sénégal" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { name: "robots", content: "index, follow" },
    { name: "geo.region", content: "SN" },
    { name: "geo.placename", content: "Dakar" },
    { name: "geo.position", content: "14.7645042;-17.3660286" },
    { name: "ICBM", content: "14.7645042, -17.3660286" },
    {
      name: "news_keywords",
      content: "Conseil des ministres, Sénégal, gouvernement, communiqué",
    },
  ],
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify(conseilMinistresSchema),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(breadcrumbSchema),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(organizationSchema),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(governmentServiceSchema),
    },
  ],
});

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
  category: "Conseil des ministres",
  sort: "-date_published",
  limit: 9,
});

const resultsText = computed(() =>
  useResultsText({
    totalItems,
    currentPage,
    itemsPerPage,
    searchQuery,
    customLabels: {
      singular: "communiqué",
      plural: "communiqués",
      noResults: "Aucun communiqué trouvé",
      noResultsWithSearch: 'Aucun communiqué trouvé pour "{search}"',
    },
  }),
);

const formatDateISO = (date: string) => {
  return new Date(date).toISOString();
};
</script>

<template>
  <div
    class="container mx-auto sm:px-4"
    itemscope
    itemtype="https://schema.org/CollectionPage"
  >
    <div class="prose prose-sm sm:prose mx-auto my-4">
      <h1
        class="from-primary-600 to-primary-500 bg-clip-text text-center text-xl font-bold sm:text-3xl"
        itemprop="headline"
      >
        Conseil des ministres
      </h1>
    </div>

    <!-- Schema.org hidden metadata -->
    <div
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
        <meta
          itemprop="jobTitle"
          content="Président de la République du Sénégal"
        />
      </div>
    </div>

    <div class="mb-8">
      <UInput
        :model-value="searchQuery"
        placeholder="Rechercher un communiqué..."
        icon="i-heroicons-magnifying-glass"
        class="custom-shadow mx-auto w-full"
        size="lg"
        @update:model-value="setSearchQuery"
      />
      <div
        class="mt-2 flex flex-col items-center justify-between text-sm text-gray-500 sm:flex-row"
      >
        <span>{{ resultsText }}</span>
      </div>
    </div>

    <div v-if="loading" class="flex min-h-48 items-center justify-center">
      <UIcon
        name="i-heroicons-arrow-path"
        class="text-primary h-12 w-12 animate-spin"
      />
    </div>

    <UAlert
      v-else-if="error"
      title="Erreur de chargement"
      description="Impossible de charger les communiqués du Conseil des ministres"
      color="red"
      icon="i-heroicons-exclamation-triangle"
    />

    <div v-else-if="articles.length === 0" class="py-12 text-center">
      <UIcon
        name="i-heroicons-document-magnifying-glass"
        class="mx-auto mb-4 h-12 w-12 text-gray-400"
      />
      <h3 class="mb-2 text-lg font-medium text-gray-900">
        Aucun communiqué trouvé
      </h3>
      <p class="text-gray-500">Essayez de modifier vos critères de recherche</p>
    </div>

    <div v-else>
      <div
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        itemscope
        itemtype="https://schema.org/ItemList"
        itemprop="mainEntity"
      >
        <meta itemprop="numberOfItems" :content="`${articles.length}`" />

        <article
          v-for="(item, index) in articles"
          :key="item.id"
          itemscope
          itemtype="https://schema.org/GovernmentAnnouncement"
          itemprop="itemListElement"
          class="group relative overflow-hidden rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <meta itemprop="position" :content="`${index + 1}`" />
          <meta
            itemprop="url"
            :content="`${siteUrl}/conseil-des-ministres/${item.id}/${item.slug}`"
          />
          <meta
            itemprop="datePublished"
            :content="formatDateISO(item.date_published)"
          />

          <div
            itemprop="publisher"
            itemscope
            itemtype="https://schema.org/GovernmentOrganization"
          >
            <meta itemprop="name" content="Conseil des ministres du Sénégal" />
          </div>

          <UCard>
            <NuxtLink
              :to="`/conseil-des-ministres/${item.id}/${item.slug}`"
              class="block"
              itemprop="url"
            >
              <div class="relative">
                <div
                  itemprop="image"
                  itemscope
                  itemtype="https://schema.org/ImageObject"
                >
                  <CmsImage
                    :src="item.cover_image"
                    :alt="item.title || 'Communiqué du conseil des ministres'"
                    :quality="50"
                    :fallback="'/images/communique-conseil-des-ministres.jpeg'"
                    class="h-48 w-full object-cover"
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
                  <meta itemprop="width" content="300" />
                  <meta itemprop="height" content="192" />
                </div>

                <div
                  class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4"
                >
                  <p class="text-sm font-medium text-white">
                    <time
                      v-if="item.date_published"
                      :datetime="formatDateISO(item.date_published)"
                      itemprop="datePublished"
                    >
                      {{ $dateformatWithDayName(item.date_published) }}
                    </time>
                  </p>
                </div>
              </div>

              <div class="p-2">
                <h2
                  class="group-hover:text-primary line-clamp-2 font-semibold transition-colors"
                  itemprop="headline"
                >
                  {{ item.title || "Communiqué du conseil des ministres" }}
                </h2>

                <!-- Additional metadata -->
                <meta
                  itemprop="name"
                  :content="item.title || 'Communiqué du conseil des ministres'"
                />
                <meta itemprop="category" content="Communiqué gouvernemental" />
                <meta
                  itemprop="about"
                  content="Conseil des ministres du Sénégal"
                />
              </div>
            </NuxtLink>
          </UCard>
        </article>
      </div>

      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <UPagination
          :model-value="currentPage"
          :total="totalItems"
          :default-page="1"
          :show-edges="true"
          :sibling-count="2"
          :active-button="{ color: 'yellow' }"
          :ui="{
            wrapper: 'flex items-center gap-1',
            base: 'min-w-8 min-h-8 flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
            active: 'bg-gray-900 text-white',
            inactive: 'bg-white text-gray-900 hover:bg-gray-100',
          }"
          @update:model-value="setCurrentPage"
        />
      </div>
    </div>
  </div>
</template>
