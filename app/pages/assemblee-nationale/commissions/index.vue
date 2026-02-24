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

// ✅ Nouvelle architecture : useCmsCollection + useCollectionState
// Plus de onMounted() → SSR-friendly
const {
  commissions,
  loading,
  error,
  searchQuery,
  setSearchQuery
} = useAssemblyCommissions();

const router = useRouter();

// Compatibilité avec l'ancien code : filtrage local
const filteredCommissions = computed(() => {
  if (!commissions.value) return [];

  // Si searchQuery est vide, retourner toutes les commissions
  if (!searchQuery.value) return commissions.value;

  // Sinon, filtrer localement (la recherche côté serveur est déjà active via useCmsCollection)
  return commissions.value.filter((commission) =>
    commission.name?.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sticky Header Mobile -->
    <div class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95 md:relative md:border-0 md:bg-transparent md:py-6 md:backdrop-blur-none dark:md:bg-transparent">
      <div class="mx-auto max-w-4xl">
        <!-- Breadcrumb desktop only -->
        <div class="mb-2 hidden md:block">
          <AppBreadcrumb :items="[
            { label: 'Assemblée nationale', to: '/assemblee-nationale' },
            { label: 'Commissions' }
          ]" />
        </div>
        
        <div class="flex items-center justify-between gap-4">
          <!-- Back button mobile -->
          <NuxtLink 
            to="/assemblee-nationale" 
            class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 active:scale-95 dark:bg-gray-700 md:hidden"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </NuxtLink>
          
          <div class="flex-1">
            <h1 class="text-lg font-semibold text-gray-900 dark:text-white md:text-2xl">
              Commissions parlementaires
            </h1>
            <p class="hidden text-sm text-gray-500 dark:text-gray-400 md:block">
              15e législature de l'Assemblée nationale
            </p>
          </div>
          
          <!-- Stats badge -->
          <div v-if="!loading && commissions?.length" class="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 dark:bg-emerald-900/30">
            <UIcon name="i-heroicons-building-library" class="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span class="text-sm font-medium text-emerald-700 dark:text-emerald-300">{{ commissions.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="mx-auto max-w-4xl px-4 pb-24 pt-4 md:pt-0">
      <!-- Barre de recherche -->
      <div class="mb-6">
        <div class="relative">
          <UIcon name="i-heroicons-magnifying-glass" class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            :value="searchQuery"
            type="text"
            placeholder="Rechercher une commission..."
            class="w-full rounded-xl border-0 bg-white py-3.5 pl-12 pr-4 text-gray-900 ring-1 ring-gray-200 transition-shadow placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-emerald-500"
            @input="setSearchQuery(($event.target as HTMLInputElement).value)"
          >
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 6" :key="i" class="rounded-2xl bg-white p-5 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
          <div class="flex items-start gap-4">
            <USkeleton class="h-12 w-12 flex-shrink-0 rounded-xl" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-5 w-3/4" />
              <USkeleton class="h-4 w-1/2" />
              <USkeleton class="h-3 w-1/4" />
            </div>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="rounded-2xl bg-red-50 p-6 text-center dark:bg-red-900/20">
        <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <UIcon name="i-heroicons-exclamation-triangle" class="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 class="font-medium text-red-800 dark:text-red-300">Erreur de chargement</h3>
        <p class="mt-1 text-sm text-red-600 dark:text-red-400">Impossible de charger les commissions</p>
      </div>

      <!-- Liste des commissions -->
      <div v-else-if="filteredCommissions.length > 0" class="space-y-3">
        <NuxtLink
          v-for="commission in filteredCommissions"
          :key="commission.id"
          :to="`/assemblee-nationale/commissions/${commission.id}`"
          class="group flex items-start gap-4 rounded-2xl bg-white p-4 ring-1 ring-gray-100 transition-all active:scale-[0.99] hover:ring-emerald-200 hover:shadow-md dark:bg-gray-800 dark:ring-gray-700 dark:hover:ring-emerald-700"
        >
          <!-- Icon -->
          <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-sm">
            <UIcon name="i-heroicons-user-group" class="h-6 w-6" />
          </div>
          
          <!-- Content -->
          <div class="min-w-0 flex-1">
            <h2 class="font-semibold text-gray-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
              {{ commission.name }}
            </h2>
            
            <!-- President -->
            <div v-if="commission.president" class="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <UIcon name="i-heroicons-user" class="h-4 w-4" />
              <span>{{ commission.president.first_name }} {{ commission.president.last_name }}</span>
              <span class="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Président</span>
            </div>
            
            <!-- Members count -->
            <div class="mt-2 flex items-center gap-3">
              <span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                <UIcon name="i-heroicons-users" class="h-3.5 w-3.5" />
                {{ commission.membersCount || 0 }} membres
              </span>
              <span class="text-xs text-gray-400 dark:text-gray-500">#{{ commission.id }}</span>
            </div>
          </div>
          
          <!-- Arrow -->
          <UIcon 
            name="i-heroicons-chevron-right" 
            class="h-5 w-5 flex-shrink-0 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-500 dark:text-gray-600 dark:group-hover:text-emerald-400" 
          />
        </NuxtLink>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="rounded-2xl bg-white p-8 text-center ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
      >
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
          <UIcon name="i-heroicons-magnifying-glass" class="h-8 w-8 text-gray-400" />
        </div>
        <h3 class="font-medium text-gray-900 dark:text-white">Aucune commission trouvée</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Essayez de modifier votre recherche
        </p>
        <button 
          v-if="searchQuery"
          class="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
          @click="setSearchQuery('')"
        >
          <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
          Effacer la recherche
        </button>
      </div>
    </div>
  </div>
</template>
