<script setup lang="ts">
const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const title = "Commissions de l'Assemblée nationale du Sénégal | 15e législature";
const description = "Découvrez les commissions parlementaires de l'Assemblée nationale du Sénégal. Organisation, présidents et membres des commissions de la 15e législature.";
const url = `${siteUrl}/assemblee-nationale/commissions`;
const image = `${siteUrl}/images/commissions-assemblee-senegal.webp`;

const commissionsCollectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": title,
  "description": description,
  "url": url,
  "image": image,
  "isPartOf": {
    "@type": "WebSite",
    "name": siteName,
    "url": siteUrl,
  },
  "about": {
    "@type": "GovernmentOrganization",
    "name": "Assemblée nationale du Sénégal",
    "description": "Parlement de la République du Sénégal",
    "url": `${siteUrl}/assemblee-nationale`,
  },
  "mainEntity": {
    "@type": "ItemList",
    "name": "Commissions parlementaires",
    "description": "Liste des commissions de l'Assemblée nationale du Sénégal",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": siteUrl,
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Assemblée nationale",
      "item": `${siteUrl}/assemblee-nationale`,
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Commissions",
      "item": url,
    },
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "LegislativeBuilding",
  "name": "Assemblée nationale du Sénégal",
  "url": `${siteUrl}/assemblee-nationale`,
  "description": "Institution législative avec ses commissions parlementaires spécialisées",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Avenue Léopold Sédar Senghor",
    "addressLocality": "Dakar",
    "addressCountry": "SN",
  },
  "governmentType": "Legislature",
  "numberOfMembers": 165,
  "legislativeTerm": "15e législature",
  "subOrganization": {
    "@type": "GovernmentOrganization",
    "name": "Commissions parlementaires",
    "description": "Organes spécialisés de l'Assemblée nationale",
  },
};

const governmentServiceSchema = {
  "@context": "https://schema.org",
  "@type": "GovernmentService",
  "name": "Commissions parlementaires du Sénégal",
  "description": "Services des commissions spécialisées de l'Assemblée nationale pour l'examen des projets de loi",
  "provider": {
    "@type": "GovernmentOrganization",
    "name": "Assemblée nationale du Sénégal",
  },
  "areaServed": {
    "@type": "Country",
    "name": "Sénégal",
  },
  "serviceType": "Travail législatif",
};

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
    "commissions parlementaires Sénégal",
    "Assemblée nationale commissions",
    "commissions législatives Sénégal",
    "15e législature commissions",
    "travail parlementaire Sénégal",
    "présidents commissions Assemblée",
    "membres commissions députés",
  ].join(", "),
});

useHead({
  htmlAttrs: { lang: "fr-SN" },
  link: [{ rel: "canonical", href: url }],
  meta: [
    { name: "theme-color", content: themeColor },
    { name: "author", content: "Assemblée nationale du Sénégal" },
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
      children: JSON.stringify(commissionsCollectionSchema),
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

const { commissions, loading, error } = useAssemblyCommissions();
const router = useRouter();

const searchQuery = ref("");

const filteredCommissions = computed(() => {
  if (!commissions.value) return [];
  return commissions.value.filter((commission) =>
    commission.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});
</script>

<template>
  <div class="container mx-auto px-2 py-4">
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      label="15e législature"
      color="gray"
      @click.native="router.back()"
    />
    <div class="mx-auto max-w-4xl">
      <div class="prose prose-sm sm:prose my-2">
        <h1 class="">Commissions de l'Assemblée</h1>
      </div>

      <!-- Barre de recherche -->
      <div class="mb-4">
        <UInput
          v-model="searchQuery"
          placeholder="Rechercher une commission..."
          icon="i-heroicons-magnifying-glass-20-solid"
          size="lg"
          color="gray"
          class="w-full"
        />
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="py-8 text-center text-red-500">
        {{ error }}
      </div>

      <!-- Liste des commissions -->
      <div v-else class="grid gap-2">
        <UCard
          v-for="commission in filteredCommissions"
          :key="commission.id"
          class="rounded-lg border-none bg-gray-50 p-4 transition-all hover:bg-gray-100 hover:shadow-lg"
        >
          <NuxtLink
            :to="`/assemblee-nationale/commissions/${commission.id}`"
            class="flex items-center justify-between"
          >
            <div>
              <h2 class="text-lg font-medium">
                <span class="text-green-700">#{{ commission.id }} </span>
                {{ commission.name }}
              </h2>
              <p v-if="commission.president" class="text-sm text-gray-500">
                Président {{ commission.president.first_name }}
                {{ commission.president.last_name }}
              </p>
              <p class="text-sm text-gray-500">
                {{ commission.members.length }} membres
              </p>
            </div>
            <UIcon
              name="i-heroicons-chevron-right"
              class="h-5 w-5 text-gray-400"
            />
          </NuxtLink>
        </UCard>
      </div>

      <!-- Empty state -->
      <div
        v-if="!loading && !error && filteredCommissions.length === 0"
        class="py-8 text-center text-gray-500"
      >
        Aucune commission trouvée
      </div>
    </div>
  </div>
</template>