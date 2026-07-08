<script setup lang="ts">
import type { Media, MediaType } from "../../../types/media";
import { typeDisplayMap, typeColorMap, typeIconMap } from "../../../types/media";

// Utilisation du composable pour les métadonnées
const { siteName, siteUrl, defaultImage, keywords, themeColor } =
  useSiteMetadata();

const title = "Liste des médias reconnus au Sénégal | Vie-Publique.sn";
const description =
  "Liste officielle des médias reconnus au Sénégal par le MCTN. Télévisions, radios, presse écrite et médias en ligne sénégalais.";
const url = `${siteUrl}/medias`;
const image = `${siteUrl}/images/share-media.JPG`;
const config = useRuntimeConfig();

// Schema JSON-LD pour les médias
const mediasSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: title,
  description: description,
  url: url,
  image: image,
  isPartOf: {
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  },
  about: [
    {
      "@type": "Thing",
      name: "Médias sénégalais",
    },
    {
      "@type": "Organization",
      name: "MCTN Sénégal",
      description:
        "Ministère de la Communication, des Télécommunications et du Numérique",
    },
  ],
  mainEntity: {
    "@type": "ItemList",
    name: "Médias reconnus au Sénégal",
    description: "Liste officielle des médias reconnus par le MCTN",
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
      name: "Annuaires",
      item: `${siteUrl}/annuaires`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Médias",
      item: url,
    },
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: "Médias du Sénégal",
  url: url,
  description: "Ensemble des médias reconnus officiellement au Sénégal",
  address: {
    "@type": "PostalAddress",
    addressCountry: "SN",
    addressLocality: "Dakar",
  },
  areaServed: {
    "@type": "Country",
    name: "Sénégal",
  },
  publishingPrinciples: `${siteUrl}/ethique-medias`,
  correctionsPolicy: `${siteUrl}/corrections`,
};

const datasetSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Liste des médias reconnus au Sénégal",
  description:
    "Base de données officielle des médias reconnus par le MCTN du Sénégal",
  url: url,
  publisher: {
    "@type": "GovernmentOrganization",
    name: "MCTN Sénégal",
  },
  dateModified: "2025-02-06",
  license: "https://creativecommons.org/licenses/by/4.0/",
  distribution: {
    "@type": "DataDownload",
    encodingFormat: "application/pdf",
    contentUrl: useCmsFileAbsolute('e703d8f8-d175-4950-a909-92d567782b47/medias-2025.pdf'),
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
    "médias sénégalais reconnus",
    "MCTN Sénégal",
    "télévision Sénégal",
    "radio Sénégal",
    "presse écrite Sénégal",
    "médias en ligne Sénégal",
    "journalisme Sénégal",
    "communication Sénégal",
  ].join(", "),
});

// Head Configuration
useHead({
  htmlAttrs: { lang: "fr-SN" },
  link: [{ rel: "canonical", href: url }],
  meta: [
    { name: "theme-color", content: themeColor },
    { name: "author", content: siteName },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { name: "robots", content: "index, follow" },
    { name: "geo.region", content: "SN" },
    { name: "geo.placename", content: "Dakar" },
    { name: "geo.position", content: "14.7645042;-17.3660286" },
    { name: "ICBM", content: "14.7645042, -17.3660286" },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify(mediasSchema),
    },
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify(breadcrumbSchema),
    },
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify(organizationSchema),
    },
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify(datasetSchema),
    },
  ],
});

// Utilisation du nouveau composable
const route = useRoute();
const {
  medias,
  loading,
  error,
  searchQuery,
  filterType,
  totalsByType,
  setSearchQuery,
  setFilterType,
} = useMedias();

// Fonction pour créer l'URL vers détails en gardant les filtres actuels
const getDetailUrl = (media: Media) => {
  const slug = media.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const query = { ...route.query };

  return {
    path: `/medias/${media.id}/${slug}`,
    query,
  };
};

// État pour le tri
const sortOrder = ref<"asc" | "desc" | null>(null);
const sortField = ref<"name" | "type" | null>(null);

// Computed properties
const types = computed(() => {
  return Object.keys(totalsByType.value) as MediaType[];
});

const mediaStats = computed(() => {
  return types.value.map((type) => ({
    type,
    count: totalsByType.value[type] || 0,
  }));
});

const sortedMedias = computed(() => {
  if (!medias.value) return [];
  if (!sortField.value || !sortOrder.value) {
    return medias.value;
  }

  return [...medias.value].sort((a, b) => {
    const comparison =
      sortField.value === "name"
        ? a.name.localeCompare(b.name)
        : a.type.localeCompare(b.type);
    return sortOrder.value === "asc" ? comparison : -comparison;
  });
});

const totalMedias = computed(() => {
  return Object.values(totalsByType.value).reduce((sum, count) => sum + count, 0);
});

// Méthodes
const toggleSort = (field: "name" | "type") => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortOrder.value = "asc";
  }
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
};

</script>

<template>
  <div class="min-h-screen space-y-2 p-0 pb-16">
    <AppBreadcrumb
      :items="[
        { label: 'Médias' }
      ]"
    />

    <NuxtLink
      to="/annuaires"
      class="mb-2 inline-flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-200"
    >
      <UIcon name="i-heroicons-arrow-left" class="mr-2 h-5 w-5" />
      Retour
    </NuxtLink>

    <UCard class="custom-shadow pt-0">
      <template #header>
        <div class="flex flex-col items-start gap-2">
          <h1 class="text-xl font-bold sm:text-2xl">
            Liste des {{ totalMedias }} médias reconnus au Sénégal
          </h1>

          <div class="text-center">
            <p class="mb-2 text-sm text-gray-500">Mis à jour 06 Février 2025</p>
          </div>

          <div
            class="grid w-full grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-6"
          >
            <div
              v-for="stat in mediaStats"
              :key="stat.type"
              class="cursor-pointer rounded-lg p-1 transition-all hover:scale-105"
              :class="[
                typeColorMap[stat.type as MediaType],
                filterType === stat.type ? 'ring-primary ring-2' : '',
              ]"
              @click="
                setFilterType(filterType === stat.type ? 'all' : stat.type)
              "
            >
              <div class="mb-2 flex items-center gap-2">
                <UIcon
                  :name="typeIconMap[stat.type as MediaType]"
                  class="h-4 w-4 text-gray-600"
                />
                <h3
                  class="truncate text-xs font-medium text-gray-600 sm:text-sm"
                  :title="typeDisplayMap[stat.type as MediaType]"
                >
                  {{ typeDisplayMap[stat.type as MediaType] }}
                </h3>
              </div>
              <p class="mt-1 text-xl font-bold sm:text-2xl">{{ stat.count }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Loading state avec skeleton -->
      <template v-if="loading">
        <div class="space-y-4">
          <div class="flex gap-2">
            <div class="h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700 sm:w-1/2"></div>
            <div class="h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700 sm:w-1/2"></div>
          </div>
          <div class="space-y-2">
            <div
              v-for="i in 10"
              :key="`skeleton-${i}`"
              class="flex animate-pulse gap-3 border-b p-2"
            >
              <div class="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-700"></div>
                <div class="h-3 w-1/4 rounded bg-gray-200 dark:bg-gray-600"></div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Error state -->
      <UAlert
        v-else-if="error"
        title="Erreur"
        :description="`${error}`"
        color="red"
        icon="i-heroicons-exclamation-triangle"
      />

      <template v-else>
        <!-- Filtres -->
        <div class="mb-2 flex flex-col gap-2 sm:flex-row">
          <UInput
            :model-value="searchQuery"
            placeholder="Rechercher un média..."
            icon="i-heroicons-magnifying-glass"
            class="w-full sm:w-1/2"
            @update:model-value="setSearchQuery"
          />
          <USelect
            :model-value="filterType === 'all' ? null : filterType"
            :options="
              types.map((type) => ({
                label: typeDisplayMap[type as MediaType],
                value: type,
              }))
            "
            placeholder="Filtrer par type"
            clearable
            class="w-full sm:w-1/2"
            icon="i-heroicons-funnel"
            @update:model-value="(value) => setFilterType(value || 'all')"
          />
        </div>

        <!-- Table -->
        <div class="relative overflow-x-auto">
          <div class="max-h-[600px] overflow-y-auto">
            <table class="w-full">
              <thead class="sticky top-0 z-10 bg-white shadow-sm">
                <tr class="border-b">
                  <th
                    class="w-3/4 cursor-pointer p-2 text-left hover:bg-gray-50"
                    @click="toggleSort('name')"
                  >
                    <div class="flex items-center gap-2">
                      Média
                      <UIcon
                        :name="
                          sortField === 'name'
                            ? sortOrder === 'asc'
                              ? 'i-heroicons-arrow-up'
                              : 'i-heroicons-arrow-down'
                            : 'i-heroicons-arrows-up-down'
                        "
                        class="h-4 w-4"
                      />
                    </div>
                  </th>
                  <th
                    class="w-1/4 cursor-pointer p-2 text-left hover:bg-gray-50"
                  >
                    <div class="flex items-center gap-2">
                      Type
                      <UIcon
                        :name="
                          sortField === 'type'
                            ? sortOrder === 'asc'
                              ? 'i-heroicons-arrow-up'
                              : 'i-heroicons-arrow-down'
                            : 'i-heroicons-arrows-up-down'
                        "
                        class="hidden h-4 w-4"
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="media in sortedMedias"
                  :key="media.id"
                  class="border-b hover:bg-gray-50"
                >
                  <td class="p-2">
                    <NuxtLink
                      :to="getDetailUrl(media)"
                      class="flex items-center gap-3"
                    >
                      <UAvatar
                        :src="useCmsImage(media.logo)"
                        :alt="media.name"
                        :text="getInitials(media.name)"
                        size="sm"
                        class="flex-shrink-0"
                      />
                      <div class="min-w-0 flex-1">
                        <div
                          class="sm:text-normal break-words text-sm font-medium"
                        >
                          {{ media.name }}
                        </div>
                      </div>
                    </NuxtLink>
                  </td>
                  <td class="p-2">
                    <div class="flex items-center gap-1">
                      <UBadge
                        variant="soft"
                        color="gray"
                        class="gray whitespace-normal text-xs"
                        size="sm"
                      >
                        <UIcon
                          :name="typeIconMap[media.type]"
                          class="h-4 w-4 text-gray-600"
                        />
                        {{ typeDisplayMap[media.type] }}
                      </UBadge>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </UCard>
    <div>
      <a
        class="text-sm text-blue-700"
        :href="
          useCmsFile(
            `e703d8f8-d175-4950-a909-92d567782b47/liste-medias-enregistres-mctn.pdf`,
          )
        "
        target="_blank"
      >
        📄 Source MCTN - Mis à jour du 06 Février 2025
      </a>
    </div>
  </div>
</template>

<style scoped>
.table-container {
  max-height: 600px;
  overflow-y: auto;
}
</style>
