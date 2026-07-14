<script setup lang="ts">
import HomeLatestDocuments from '~/components/HomeLatestDocuments.vue';

const siteUrl = useRuntimeConfig().public.siteUrl || 'https://www.vie-publique.sn';

// Recherche scopée documents : renvoie vers la liste /documents/public
// (recherche Typesense C10 + filtres/pagination déjà en place ; paramètre ?q=,
// cf. urlParamsMapping de useDocuments)
const searchQuery = ref('');
const performSearch = () => {
  const q = searchQuery.value.trim();
  if (q.length >= 2) {
    navigateTo({ path: '/documents/public', query: { q } });
  }
};

const seoTitle = 'Documents officiels du Sénégal';
const seoDescription =
  "Accédez aux documents officiels du Sénégal: Journal officiel, rapports d'audit, codes généraux et plus encore.";

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: `${siteUrl}/images/share-linkedin.png`,
  ogUrl: `${siteUrl}/documents`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
});

useHead({
  link: [
    { rel: 'canonical', href: `${siteUrl}/documents` },
    {
      rel: 'alternate',
      type: 'application/rss+xml',
      title: 'Vie-Publique.sn — Documents officiels',
      href: '/documents/rss.xml',
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: seoTitle,
        description: seoDescription,
        url: `${siteUrl}/documents`,
      }),
    },
  ],
});

const documentCategories = [
  {
    title: 'Tous les documents',
    description: 'Explorer tous les documents',
    icon: 'i-heroicons-squares-2x2',
    to: '/documents/public',
    gradient: 'from-purple-500 to-purple-600',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    title: 'Journal Officiel',
    description: 'Textes, Lois, Décrets, Arrêtés',
    icon: 'i-heroicons-newspaper',
    to: '/documents/journal-officiel-senegal',
    gradient: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    title: 'Rapports Publics',
    description: 'Cours des Comptes, OFNAC...',
    icon: 'i-heroicons-document-chart-bar',
    to: '/documents/rapports-audit',
    gradient: 'from-emerald-500 to-emerald-600',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
  {
    title: 'Documents Budgétaires',
    description: 'Lois de finances et annexes',
    icon: 'i-heroicons-banknotes',
    to: '/documents/budget',
    gradient: 'from-amber-500 to-amber-600',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
  },
  {
    title: 'Documents Stratégie',
    description: 'Stratégies nationales',
    icon: 'i-heroicons-presentation-chart-line',
    to: '/documents/strategies',
    gradient: 'from-rose-500 to-rose-600',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
  },
  {
    title: 'Codes Généraux',
    description: 'Constitution, famille, presse...',
    icon: 'i-heroicons-scale',
    to: '/documents/codes',
    gradient: 'from-indigo-500 to-indigo-600',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-500',
  },
  {
    title: 'Statistiques',
    description: 'Enquêtes et données statistiques',
    icon: 'i-heroicons-chart-pie',
    to: '/documents/statistiques',
    gradient: 'from-cyan-500 to-cyan-600',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-500',
  },
  {
    title: 'Parlementaire',
    description: 'Rapports et questions parlementaires',
    icon: 'i-heroicons-building-library',
    to: '/documents/parlementaire',
    gradient: 'from-orange-500 to-orange-600',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
  },
  {
    title: 'Élection',
    description: 'Documents électoraux officiels',
    icon: 'i-heroicons-check-badge',
    to: '/documents/elections',
    gradient: 'from-teal-500 to-teal-600',
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-500',
  },
];
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <div class="container mx-auto px-4">
      <AppBreadcrumb :items="[{ label: 'Documents' }]" />
    </div>

    <!-- Header -->
    <header class="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div class="container mx-auto px-4 py-4">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Documents</h1>
        <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Accédez aux documents officiels du Sénégal
        </p>

        <!-- Search (même style que /documents/public : champ gris dans le header blanc) -->
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
            placeholder="Rechercher un document, un rapport..."
            aria-label="Rechercher dans les documents officiels"
            class="block w-full rounded-xl border-0 bg-gray-100 py-3 pl-11 pr-12 text-sm text-gray-900 ring-1 ring-transparent transition-all placeholder:text-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:bg-gray-800/80 dark:focus:ring-gray-500 sm:py-2.5"
            @keyup.enter="performSearch"
          />
          <button
            v-if="searchQuery.trim().length >= 2"
            type="button"
            aria-label="Lancer la recherche"
            class="absolute inset-y-0 right-2 my-auto flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700"
            @click="performSearch"
          >
            <UIcon name="i-heroicons-arrow-right" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-4">
      <!-- Latest Documents Section -->
      <section class="mt-2">
        <HomeLatestDocuments hide-cta title-align="left" :limit="4" :desktop-cols="4" />
      </section>

      <!-- Categories Grid -->
      <h2 class="mb-4 mt-8 text-lg font-semibold text-gray-800 dark:text-white">
        Parcourir par catégorie
      </h2>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
        <NuxtLink
          v-for="cat in documentCategories"
          :key="cat.title"
          :to="cat.to"
          class="group relative flex flex-col items-center rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-gray-100 transition-all active:scale-[0.97] dark:bg-gray-800 dark:ring-gray-700 sm:p-5 sm:hover:shadow-lg"
        >
          <!-- Icon Container -->
          <div
            :class="[
              cat.iconBg,
              'flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 sm:h-14 sm:w-14',
            ]"
          >
            <UIcon :name="cat.icon" :class="[cat.iconColor, 'h-6 w-6 sm:h-7 sm:w-7']" />
          </div>

          <!-- Text -->
          <h3 class="mt-3 text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
            {{ cat.title }}
          </h3>
          <p class="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
            {{ cat.description }}
          </p>

          <!-- Hover Arrow (desktop) -->
          <div
            class="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 sm:right-3 sm:top-3"
          >
            <UIcon name="i-heroicons-arrow-up-right" class="h-4 w-4 text-gray-400" />
          </div>
        </NuxtLink>
      </div>
    </main>
  </div>
</template>
