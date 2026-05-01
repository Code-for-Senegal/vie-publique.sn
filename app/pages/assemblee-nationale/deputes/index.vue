<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <!-- Breadcrumb -->
    <div class="container mx-auto px-4 pt-2">
      <AppBreadcrumb :items="[
        { label: 'Assemblée nationale', to: '/assemblee-nationale' },
        { label: 'Députés' }
      ]" />
    </div>

    <!-- Sticky Header -->
    <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95">
      <div class="container mx-auto px-4 py-3">
        <!-- Title Row -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
              Députés
            </h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ filteredDeputiesCount }} député{{ filteredDeputiesCount > 1 ? 's' : '' }} · 15e législature
            </p>
          </div>

          <!-- Gender Pills -->
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95"
              :class="[
                !selectedGender
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              ]"
              @click="selectedGender = null"
            >
              Tous
            </button>
            <button
              type="button"
              class="rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95"
              :class="[
                selectedGender === 'M'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              ]"
              @click="selectedGender = selectedGender === 'M' ? null : 'M'"
            >
              Hommes
            </button>
            <button
              type="button"
              class="rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95"
              :class="[
                selectedGender === 'F'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              ]"
              @click="selectedGender = selectedGender === 'F' ? null : 'F'"
            >
              Femmes
            </button>
          </div>
        </div>

        <!-- Search Input -->
        <div class="group relative mt-3">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <UIcon
              name="i-heroicons-magnifying-glass-20-solid"
              class="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-gray-500"
            />
          </div>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Rechercher un député par nom..."
            class="block w-full rounded-xl border-0 bg-gray-100 py-3 pl-11 pr-10 text-sm text-gray-900 ring-1 ring-transparent transition-all placeholder:text-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 sm:py-2.5 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:bg-gray-800/80 dark:focus:ring-gray-500"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            @click="searchQuery = ''"
          >
            <span class="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
              <UIcon name="i-heroicons-x-mark-20-solid" class="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" />
            </span>
          </button>
        </div>

        <!-- Group Filters - Horizontal Scroll -->
        <nav class="-mx-4 mt-3 overflow-x-auto px-4 pb-1 scrollbar-hide" aria-label="Filtrer par groupe">
          <div class="flex gap-1.5 py-0.5">
            <button
              v-for="group in groupOptions"
              :key="group.value"
              type="button"
              class="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95"
              :class="[
                filterValue === group.value
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700',
              ]"
              :style="filterValue === group.value && group.value !== 'all' ? { backgroundColor: group.color } : (filterValue === group.value ? { backgroundColor: '#111827' } : {})"
              @click="toggleGroup(group.value)"
            >
              <span
                v-if="filterValue !== group.value && group.value !== 'all'"
                class="h-2 w-2 rounded-full"
                :style="{ backgroundColor: group.color }"
              />
              {{ group.label }}
            </button>
          </div>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 pt-4">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <div v-for="n in 10" :key="n" class="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
          <USkeleton class="aspect-[3/4] w-full" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-12 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <UIcon name="i-heroicons-exclamation-triangle" class="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Erreur de chargement</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ error }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredDeputies.length === 0" class="py-16 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <UIcon name="i-heroicons-user-group" class="h-8 w-8 text-gray-400" />
        </div>
        <h2 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Aucun député trouvé</h2>
        <p class="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Essayez de modifier vos critères de recherche
        </p>
        <button
          type="button"
          class="rounded-full bg-gray-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-800 active:scale-95 dark:bg-white dark:text-gray-900"
          @click="searchQuery = ''; setFilterValue('all'); selectedGender = null"
        >
          Réinitialiser les filtres
        </button>
      </div>

      <!-- Deputies Grid -->
      <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <NuxtLink
          v-for="deputy in filteredDeputies"
          :key="deputy.id"
          :to="`/assemblee-nationale/deputes/${deputy.id}/${$getSlugifyUrlPath(deputy.first_name + ' ' + deputy.last_name)}`"
          class="deputy-card group relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-200 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-lg hover:ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 dark:hover:ring-gray-600"
        >
          <!-- Photo -->
          <img
            v-if="deputy.photo"
            :src="useCmsImage(deputy.photo, '50')"
            :alt="`${deputy.first_name} ${deputy.last_name}`"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <img
            v-else
            :src="deputy.gender === 'M' ? '/adobe-default-profil-man.jpg' : '/adobe-default-profil-women.jpg'"
            :alt="`${deputy.first_name} ${deputy.last_name}`"
            class="h-full w-full object-cover"
          />

          <!-- Gradient Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <!-- Group Badge -->
          <div
            v-if="deputy.electoral_list?.coalition"
            class="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm"
            :style="{ backgroundColor: deputy.electoral_list.coalition.color }"
          >
            {{ deputy.electoral_list.coalition.abbreviation || deputy.electoral_list.coalition.name.slice(0, 10) }}
          </div>

          <!-- Info Overlay -->
          <div class="absolute inset-x-0 bottom-0 p-3">
            <h3 class="text-sm font-semibold leading-tight text-white">
              <span class="capitalize">{{ deputy.first_name.toLowerCase() }}</span>&nbsp;
              <span class="font-bold uppercase">{{ deputy.last_name }}</span>
            </h3>
            <p class="mt-0.5 truncate text-[11px] text-white/80">
              <span v-if="deputy.birthdate">{{ $getAgeFromBirthdate(deputy.birthdate) }} ans</span>
              <span v-if="deputy.birthdate && deputy.profession"> · </span>
              <span v-if="deputy.profession" class="capitalize">{{ deputy.profession.toLowerCase() }}</span>
            </p>
            <p v-if="deputy.electoral_list?.constituency" class="mt-1 truncate text-[10px] font-medium text-white/70">
              {{ deputy.electoral_list.constituency.name }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </main>

    <!-- Scroll to top -->
    <ScrollToTopButton />
  </div>
</template>

<script setup lang="ts">
const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const title = "Députés de l'Assemblée Nationale du Sénégal | 15e législature";
const description = "Retrouvez tous les 165 députés en activité de l'Assemblée nationale du Sénégal. Liste complète de la 15e législature avec résultats de vote et analyses.";
const url = `${siteUrl}/assemblee-nationale/deputes`;
const image = `${siteUrl}/images/vpsn-share-elections.png`;

const deputiesSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": title,
  "description": description,
  "url": url,
  "image": image,
  "isPartOf": {
    "@type": "WebSite",
    "name": siteName,
    "url": siteUrl,
  },
  "about": [
    {
      "@type": "GovernmentOrganization",
      "name": "Assemblée nationale du Sénégal",
      "description": "Parlement du Sénégal",
    },
    {
      "@type": "Thing",
      "name": "15e législature du Sénégal",
    },
  ],
  "mainEntity": {
    "@type": "ItemList",
    "name": "Députés de la 15e législature",
    "description": "Liste des 165 députés élus de l'Assemblée nationale du Sénégal",
    "numberOfItems": 165,
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
      "name": "Députés",
      "item": url,
    },
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "LegislativeBuilding",
  "name": "Assemblée nationale du Sénégal",
  "url": `${siteUrl}/assemblee-nationale`,
  "description": "Parlement unicaméral de la République du Sénégal",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Avenue Léopold Sédar Senghor",
    "addressLocality": "Dakar",
    "addressCountry": "SN",
  },
  "governmentType": "Legislature",
  "numberOfMembers": 165,
  "politicalSystem": "Démocratie parlementaire",
  "foundingDate": "1960",
  "legislativeTerm": "15e législature",
};

const governmentSchema = {
  "@context": "https://schema.org",
  "@type": "GovernmentOrganization",
  "name": "Assemblée nationale du Sénégal",
  "url": url,
  "description": "Institution législative de la République du Sénégal composée de 165 députés",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "SN",
    "addressLocality": "Dakar",
  },
  "areaServed": {
    "@type": "Country",
    "name": "Sénégal",
  },
  "parentOrganization": {
    "@type": "GovernmentOrganization",
    "name": "République du Sénégal",
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
    "députés Sénégal",
    "Assemblée nationale Sénégal",
    "15e législature",
    "parlement sénégalais",
    "élus nationaux Sénégal",
    "représentants peuple sénégalais",
    "parlementaires Sénégal",
    "législateurs Sénégal",
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
      children: JSON.stringify(deputiesSchema),
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
      children: JSON.stringify(governmentSchema),
    },
  ],
});

const route = useRoute();
const router = useRouter();

// ✅ Nouvelle architecture SSR avec synchronisation URL
const {
  deputies,
  loading,
  error,
  totalItems,
  searchQuery,
  filterValue,
  setFilterValue,
} = useAssemblyDeputies();

// Récupération des groupes pour les filtres
const { groups: assemblyGroups } = useAssemblyGroups();

// Filtre par genre avec synchronisation URL
const selectedGender = ref((route.query.gender as string) || null);

// Synchroniser le filtre genre avec l'URL
watch(selectedGender, (newGender) => {
  const query = { ...route.query };
  if (newGender) {
    query.gender = newGender;
  } else {
    delete query.gender;
  }
  router.replace({ query });
});

// Filtrer les députés par genre côté client
const filteredDeputies = computed(() => {
  if (!selectedGender.value) return deputies.value;
  return deputies.value.filter((deputy) => deputy.gender === selectedGender.value);
});

const filteredDeputiesCount = computed(() => filteredDeputies.value.length);

// Options pour le filtre par groupe
const groupOptions = computed(() => {
  const options: { value: string; label: string; color?: string }[] = [
    { value: "all", label: "Tous les groupes" },
  ];

  if (assemblyGroups.value) {
    assemblyGroups.value.forEach((group) => {
      options.push({
        value: group.id,
        label: group.name,
        color: group.color,
      });
    });
  }

  return options;
});

// Fonction pour basculer la sélection d'un groupe
const toggleGroup = (groupId) => {
  if (filterValue.value === groupId) {
    setFilterValue("all");
  } else {
    setFilterValue(groupId);
  }
};
</script>

<style scoped>
/* Hide scrollbar */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Deputy card hover effect */
.deputy-card {
  will-change: transform;
}
</style>
