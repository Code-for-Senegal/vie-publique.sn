<script setup lang="ts">
// --- Category Configuration ---

const CATEGORY_SEO: Record<
  string,
  { type: string; label: string; countLabel: string; ogImage: string }
> = {
  'journal-officiel': {
    type: 'official_journal',
    label: 'Journal Officiel',
    countLabel: 'publication',
    ogImage: '/images/vpsn-share-jors.png',
  },
  'rapports-audit': {
    type: 'audit_report',
    label: 'Rapports publics',
    countLabel: 'rapport',
    ogImage: '/images/share-linkedin.png',
  },
  strategies: {
    type: 'strategy',
    label: 'Documents Stratégies',
    countLabel: 'document',
    ogImage: '/images/share-linkedin.png',
  },
  codes: {
    type: 'code',
    label: 'Codes du Sénégal',
    countLabel: 'code',
    ogImage: '/images/vpsn-share-jors.png',
  },
  budget: {
    type: 'budget',
    label: 'Documents Budgétaires',
    countLabel: 'document',
    ogImage: '/images/vpsn-share-budget.png',
  },
};

// --- Route params ---

const route = useRoute();
const category = route.params.category as string;

const config = CATEGORY_SEO[category];
if (!config) {
  throw createError({ statusCode: 404, message: 'Catégorie non trouvée' });
}

// --- SEO ---

const siteUrl = useRuntimeConfig().public.siteUrl || 'https://www.vie-publique.sn';
const seoTitle = `${config.label} du Sénégal — Archives par année`;
const seoDescription = `Parcourez les archives du ${config.label} du Sénégal classées par année de publication.`;

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: `${siteUrl}${config.ogImage}`,
  ogUrl: `${siteUrl}/documents/${category}/annee`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
});

useHead({
  link: [{ rel: 'canonical', href: `${siteUrl}/documents/${category}/annee` }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: seoTitle,
        description: seoDescription,
        url: `${siteUrl}/documents/${category}/annee`,
      }),
    },
  ],
});

// --- Available Years ---

const { years, loading } = useAvailableYears(config.type);

const sortedYears = computed(() => {
  return [...years.value].sort((a, b) => b.year - a.year);
});

const totalDocuments = computed(() => {
  return years.value.reduce((sum, y) => sum + y.count, 0);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <div class="container mx-auto px-4">
      <AppBreadcrumb
        :items="[
          { label: 'Documents', to: '/documents' },
          { label: config.label, to: `/documents/${category}` },
          { label: 'Archives par année' },
        ]"
      />
    </div>

    <h1 class="sr-only">{{ seoTitle }}</h1>

    <!-- Header -->
    <header class="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div class="container mx-auto px-4 py-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
          {{ config.label }} — Archives par année
        </h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          <template v-if="!loading">
            {{ totalDocuments }} {{ config.countLabel }}{{ totalDocuments > 1 ? 's' : '' }} répartis
            sur {{ sortedYears.length }} années
          </template>
          <template v-else>Chargement...</template>
        </p>

        <NuxtLink
          :to="`/documents/${category}`"
          class="mt-3 inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-3 w-3" />
          Tous les {{ config.countLabel }}s
        </NuxtLink>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Loading -->
      <div
        v-if="loading"
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        <div
          v-for="i in 15"
          :key="i"
          class="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <USkeleton class="h-6 w-16" />
          <USkeleton class="mt-2 h-3 w-20" />
        </div>
      </div>

      <!-- Years Grid -->
      <div
        v-else-if="sortedYears.length > 0"
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        <NuxtLink
          v-for="y in sortedYears"
          :key="y.year"
          :to="`/documents/${category}/annee/${y.year}`"
          class="hover:border-primary-300 dark:hover:border-primary-600 group flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <span
            class="group-hover:text-primary-600 dark:group-hover:text-primary-400 text-xl font-bold text-gray-900 dark:text-white"
          >
            {{ y.year }}
          </span>
          <span class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {{ y.count }} {{ config.countLabel }}{{ y.count > 1 ? 's' : '' }}
          </span>
        </NuxtLink>
      </div>

      <!-- Empty -->
      <div v-else class="flex flex-col items-center justify-center py-16">
        <UIcon name="i-heroicons-calendar-days" class="mb-4 h-12 w-12 text-gray-300" />
        <p class="text-gray-500 dark:text-gray-400">
          Aucune année disponible pour {{ config.label }}
        </p>
      </div>
    </main>
  </div>
</template>
