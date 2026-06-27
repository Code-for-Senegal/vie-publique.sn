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

// Pas de logo en base pour les entités budget → image de partage statique dédiée
const image = computed(() => `${siteUrl}/images/vpsn-share-budget.png`);

const url = computed(() => `${siteUrl}/budget-senegal/${slug}`);

// SEO Setup
useSeoMeta({
  title: () => title.value,
  ogTitle: () => title.value,
  description: () => description.value,
  ogDescription: () => description.value,
  ogImage: () => image.value,
  ogImageAlt: () => (entity.value ? `Budget ${entity.value.name}` : "Budget de l'État du Sénégal"),
  ogUrl: () => url.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => title.value,
  twitterDescription: () => description.value,
  twitterImage: () => image.value,
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

// Format budget en milliards
const formatBudget = (value: number) => {
  if (!value) return '0';
  return value.toLocaleString('fr-FR');
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-24 dark:bg-gray-900">
    <!-- Sticky Header Mobile -->
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-lg dark:bg-gray-950/95 md:hidden">
      <div class="flex items-center gap-3 px-4 py-2.5">
        <NuxtLink
          to="/budget-senegal"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 transition-colors active:bg-gray-200 dark:bg-gray-800 dark:active:bg-gray-700"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </NuxtLink>
        <div class="min-w-0 flex-1">
          <p
            class="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
          >
            {{ level === 'institution' ? 'Institution' : 'Ministère' }}
          </p>
          <p v-if="entity" class="truncate text-base font-semibold text-gray-900 dark:text-white">
            {{ entity.name }}
          </p>
          <USkeleton v-else class="h-5 w-48" />
        </div>
        <SocialShare v-if="entity" :title="entity.name" :url="url" />
      </div>
    </header>

    <!-- Desktop Layout -->
    <div class="hidden md:block">
      <!-- Top Bar with AppBreadcrumb -->
      <div class="bg-white dark:bg-transparent">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <AppBreadcrumb
              :items="[
                { label: 'Budget', to: '/budget-senegal' },
                {
                  label: level === 'institution' ? 'Institutions' : 'Ministères',
                  to:
                    level === 'institution'
                      ? '/budget-senegal/institutions'
                      : '/budget-senegal/ministeres',
                },
                { label: entity?.name || 'Chargement...' },
              ]"
            />
            <SocialShare v-if="entity" :title="entity.name" :url="url" />
          </div>
        </div>
      </div>

      <!-- Hero Content -->
      <div
        v-if="entity && !loading"
        class="bg-gradient-to-b from-gray-50 to-white dark:bg-transparent dark:bg-none"
      >
        <div class="container mx-auto px-6 py-12">
          <div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <!-- Left: Entity Info -->
            <div class="max-w-2xl">
              <div
                class="mb-4 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 dark:bg-gray-800"
              >
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-600 dark:bg-gray-500"
                >
                  <UIcon
                    :name="
                      level === 'institution'
                        ? 'i-heroicons-building-library'
                        : 'i-heroicons-building-office-2'
                    "
                    class="h-3.5 w-3.5 text-white"
                  />
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ level === 'institution' ? 'Institution' : 'Ministère' }}
                </span>
              </div>

              <h1
                class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white lg:text-4xl"
              >
                {{ entity.name }}
              </h1>

              <p v-if="latestYear" class="mt-3 text-lg text-gray-600 dark:text-gray-400">
                Données budgétaires pour l'exercice {{ latestYear.year }}
              </p>
            </div>

            <!-- Right: Budget Summary Card -->
            <div v-if="currentBudget" class="w-full lg:w-auto">
              <div
                class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50"
              >
                <div class="flex items-start justify-between gap-8">
                  <div>
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Budget Total</p>
                    <p class="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {{ formatBudget(currentBudget) }} Mds
                    </p>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Crédits de paiement</p>
                  </div>
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800"
                  >
                    <UIcon
                      name="i-heroicons-banknotes"
                      class="h-6 w-6 text-gray-600 dark:text-gray-400"
                    />
                  </div>
                </div>

                <div
                  v-if="budgetVariation !== null && budgetVariation !== undefined"
                  class="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-800"
                >
                  <div
                    class="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                    :class="
                      budgetVariation > 0
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : budgetVariation < 0
                          ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    "
                  >
                    <UIcon
                      :name="
                        budgetVariation > 0
                          ? 'i-heroicons-arrow-trending-up'
                          : budgetVariation < 0
                            ? 'i-heroicons-arrow-trending-down'
                            : 'i-heroicons-minus'
                      "
                      class="h-4 w-4"
                    />
                    <span class="text-sm font-semibold">
                      {{ budgetVariation > 0 ? '+' : '' }}{{ budgetVariation.toFixed(1) }}%
                    </span>
                  </div>
                  <span class="text-sm text-gray-500 dark:text-gray-400">vs année précédente</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Hero -->
      <div
        v-else-if="loading"
        class="bg-gradient-to-b from-gray-50 to-white dark:bg-transparent dark:bg-none"
      >
        <div class="container mx-auto px-6 py-12">
          <div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div class="max-w-2xl">
              <USkeleton class="mb-4 h-8 w-32 rounded-full" />
              <USkeleton class="h-12 w-96" />
              <USkeleton class="mt-3 h-6 w-64" />
            </div>
            <USkeleton class="h-40 w-80 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Budget Card -->
    <div v-if="entity && currentBudget && !loading" class="px-4 pt-4 md:hidden">
      <div
        class="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/50"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <p
              class="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
            >
              Budget Total
            </p>
            <p class="mt-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              {{ formatBudget(currentBudget) }} Mds
            </p>
            <p class="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
              Crédits de paiement · {{ latestYear?.year }}
            </p>
          </div>
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"
          >
            <UIcon name="i-heroicons-banknotes" class="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
        <div
          v-if="budgetVariation !== null && budgetVariation !== undefined"
          class="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800"
        >
          <div
            class="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
            :class="
              budgetVariation > 0
                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : budgetVariation < 0
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            "
          >
            <UIcon
              :name="
                budgetVariation > 0
                  ? 'i-heroicons-arrow-trending-up'
                  : budgetVariation < 0
                    ? 'i-heroicons-arrow-trending-down'
                    : 'i-heroicons-minus'
              "
              class="h-3.5 w-3.5"
            />
            <span>{{ budgetVariation > 0 ? '+' : '' }}{{ budgetVariation.toFixed(1) }}%</span>
          </div>
          <span class="text-[11px] text-gray-500 dark:text-gray-400"
            >vs {{ (latestYear?.year || 2026) - 1 }}</span
          >
        </div>
      </div>
    </div>

    <main class="container mx-auto px-4 py-5 md:px-6 md:py-8">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-6">
        <USkeleton class="h-64 w-full rounded-2xl" />
        <USkeleton class="h-48 w-full rounded-2xl" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="mx-auto max-w-md py-12 text-center">
        <div
          class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30"
        >
          <UIcon name="i-heroicons-exclamation-triangle" class="h-10 w-10 text-red-500" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Données indisponibles</h3>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Impossible de charger les informations budgétaires pour cette entité.
        </p>
        <NuxtLink
          to="/budget-senegal"
          class="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          Retour au budget
        </NuxtLink>
      </div>

      <!-- Content -->
      <div v-else-if="entity" class="space-y-6">
        <!-- Evolution Chart -->
        <section
          v-if="evolutionChartData.length > 0"
          class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50 md:p-6"
        >
          <div class="mb-5 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Évolution</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">Historique des budgets alloués</p>
            </div>
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30"
            >
              <UIcon
                name="i-heroicons-chart-bar"
                class="h-5 w-5 text-blue-600 dark:text-blue-400"
              />
            </div>
          </div>
          <BudgetEntityEvolutionChart :data="evolutionChartData" />
        </section>

        <!-- Programs Table -->
        <section
          v-if="formattedPrograms.length > 0"
          class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50 md:p-6"
        >
          <div class="mb-5 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Programmes</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Répartition budgétaire {{ latestYear?.year }}
              </p>
            </div>
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/30"
            >
              <UIcon
                name="i-heroicons-rectangle-stack"
                class="h-5 w-5 text-purple-600 dark:text-purple-400"
              />
            </div>
          </div>
          <BudgetEntityProgramsTable :programs="formattedPrograms" />
        </section>

        <!-- Empty Programs -->
        <div
          v-else
          class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50"
        >
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <UIcon name="i-heroicons-document-chart-bar" class="h-8 w-8 text-gray-400" />
          </div>
          <p class="font-medium text-gray-900 dark:text-white">Aucun programme renseigné</p>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Les détails par programme ne sont pas disponibles pour cette entité.
          </p>
        </div>

        <!-- Quick Links -->
        <div class="flex flex-col gap-3 pt-6 sm:flex-row sm:flex-wrap sm:justify-center">
          <NuxtLink
            to="/budget-senegal/ministeres"
            class="flex items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 transition-colors active:scale-[0.98] active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:active:bg-gray-800 md:py-2.5"
          >
            <UIcon name="i-heroicons-building-office-2" class="h-5 w-5" />
            Tous les ministères
          </NuxtLink>
          <NuxtLink
            to="/budget-senegal/institutions"
            class="flex items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 transition-colors active:scale-[0.98] active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:active:bg-gray-800 md:py-2.5"
          >
            <UIcon name="i-heroicons-building-library" class="h-5 w-5" />
            Toutes les institutions
          </NuxtLink>
        </div>
      </div>
    </main>

    <ScrollToTopButton />
  </div>
</template>
