<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

// Utilisation du composable
const {
  entity,
  level,
  latestYear,
  loading,
  error,
  currentBudget,
  budgetVariation,
  evolutionChartData,
  formattedPrograms,
  programsTotal,
} = useBudgetEntity(slug);

// SEO
const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata();

const title = computed(() =>
  entity.value ? `Budget ${entity.value.name} - Sénégal` : 'Budget - Sénégal',
);

const description = computed(() =>
  entity.value
    ? `Découvrez le budget de ${entity.value.name} : montant total, évolution par année et répartition par programmes.`
    : "Budget de l'État du Sénégal",
);

const url = computed(() => `${siteUrl}/budget-senegal/${slug}`);

// SEO Setup
useSeoMeta({
  title: () => title.value,
  ogTitle: () => title.value,
  description: () => description.value,
  ogDescription: () => description.value,
  ogUrl: () => url.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => title.value,
  twitterDescription: () => description.value,
  keywords: () =>
    [
      ...keywords,
      'Budget Sénégal',
      entity.value?.name || '',
      'ministère',
      'institution',
      'finances publiques',
    ].join(', '),
});

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: () => [{ rel: 'canonical', href: url.value }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
    { name: 'robots', content: 'index, follow' },
  ],
});

// Structured Data
useSchemaOrg([
  defineBreadcrumb({
    itemListElement: () => [
      { name: 'Accueil', item: '/' },
      { name: 'Budget Sénégal', item: '/budget-senegal' },
      { name: entity.value?.name || 'Détail', item: url.value },
    ],
  }),
  defineWebPage({
    name: () => title.value,
    description: () => description.value,
    url: () => url.value,
  }),
]);
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-900">
    <!-- Breadcrumb -->
    <div class="container mx-auto px-4 pt-4">
      <AppBreadcrumb
        :items="[
          { label: 'Budget', to: '/budget-senegal' },
          { label: entity?.name || 'Détail' }
        ]"
      />
    </div>

    <!-- Sticky Header mobile -->
    <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm md:relative md:border-0 md:bg-transparent md:backdrop-blur-none dark:border-gray-800 dark:bg-gray-900/95">
      <div class="container mx-auto px-4 py-3 md:py-6">
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/budget-senegal"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 md:hidden dark:bg-gray-800"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </NuxtLink>
          <div class="min-w-0 flex-1">
            <h1 v-if="entity" class="truncate text-sm font-semibold text-gray-900 md:text-xl dark:text-white">
              {{ entity.name }}
            </h1>
            <USkeleton v-else class="h-5 w-48" />
            <p v-if="latestYear" class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Budget {{ latestYear.year }}
            </p>
          </div>
          <SocialShare v-if="entity" :title="entity.name" :url="url" />
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-4">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div class="rounded-2xl bg-white p-6 dark:bg-gray-800">
          <div class="flex flex-col items-center gap-3">
            <USkeleton class="h-6 w-32" />
            <USkeleton class="h-10 w-48" />
            <USkeleton class="h-4 w-24" />
          </div>
        </div>
        <div class="rounded-2xl bg-white p-4 dark:bg-gray-800">
          <USkeleton class="mb-4 h-5 w-40" />
          <USkeleton class="h-48 w-full" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-2xl bg-red-50 p-6 text-center dark:bg-red-900/20">
        <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto mb-3 h-10 w-10 text-red-500" />
        <h3 class="font-semibold text-red-800 dark:text-red-200">Erreur de chargement</h3>
        <p class="mt-1 text-sm text-red-600 dark:text-red-300">
          Impossible de charger les données budgétaires
        </p>
        <NuxtLink
          to="/budget-senegal"
          class="mt-4 inline-block text-sm text-red-600 underline dark:text-red-400"
        >
          Retour au budget
        </NuxtLink>
      </div>

      <!-- Content -->
      <div v-else-if="entity" class="space-y-4">
        <!-- Budget Overview Card -->
        <BudgetEntityOverview
          :entity-name="entity.name"
          :current-budget="currentBudget"
          :latest-year="latestYear?.year"
          :variation="budgetVariation"
        />

        <!-- Evolution Chart -->
        <section
          v-if="evolutionChartData.length > 0"
          class="rounded-2xl bg-white p-4 ring-1 ring-gray-100 md:p-6 dark:bg-gray-800 dark:ring-gray-700"
        >
          <h2 class="mb-4 text-sm font-bold text-gray-900 md:text-base dark:text-white">
            Évolution du budget
          </h2>
          <BudgetEntityEvolutionChart :data="evolutionChartData" />
        </section>

        <!-- Programs Table -->
        <section
          v-if="formattedPrograms.length > 0"
          class="rounded-2xl bg-white p-4 ring-1 ring-gray-100 md:p-6 dark:bg-gray-800 dark:ring-gray-700"
        >
          <h2 class="mb-4 text-sm font-bold text-gray-900 md:text-base dark:text-white">
            Répartition par programmes
            <span class="ml-1 text-emerald-600 dark:text-emerald-400">({{ latestYear?.year }})</span>
          </h2>
          <BudgetEntityProgramsTable :programs="formattedPrograms" />
        </section>

        <!-- Empty Programs -->
        <div
          v-else
          class="rounded-2xl bg-white p-8 text-center ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
        >
          <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <UIcon name="i-heroicons-document-chart-bar" class="h-7 w-7 text-gray-400" />
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Programme budgétaire non renseigné</p>
        </div>

        <!-- Entity Link (hidden for now) -->
        <div v-if="entity.public_slug" class="hidden pt-4 text-center">
          <NuxtLink
            :to="`/etat-senegal/annuaire/${entity.public_slug}`"
            class="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
          >
            <UIcon name="i-heroicons-building-office-2" class="h-4 w-4" />
            Voir la fiche complète
          </NuxtLink>
        </div>
      </div>
    </main>

    <ScrollToTopButton />
  </div>
</template>
