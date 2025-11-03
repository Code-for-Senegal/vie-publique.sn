<script setup lang="ts">
const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const title = "Budget de l'État du Sénégal | Loi de finances";
const description =
  "Découvrez le budget de l'État du Sénégal. Répartition des recettes et dépenses, indicateurs clés, dette publique et besoins de financement.";
const url = `${siteUrl}/budget`;
const image = `${siteUrl}/images/vpsn-share-budget.png`;

const budgetSchema = {
  '@context': 'https://schema.org',
  '@type': 'GovernmentService',
  name: "Budget de l'État du Sénégal",
  description: description,
  url: url,
  image: image,
  provider: {
    '@type': 'GovernmentOrganization',
    name: 'Ministère des Finances et du Budget du Sénégal',
    parentOrganization: {
      '@type': 'GovernmentOrganization',
      name: 'République du Sénégal',
    },
  },
  areaServed: {
    '@type': 'Country',
    name: 'Sénégal',
  },
  serviceType: 'Budget public',
  audience: {
    '@type': 'Audience',
    audienceType: 'Citizens, Researchers, Media',
  },
};

const datasetSchema = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Données budgétaires Sénégal',
  description:
    "Jeu de données complet du budget de l'État sénégalais incluant recettes, dépenses et allocations",
  url: url,
  keywords: ['budget', 'finances publiques', 'Sénégal', 'recettes', 'dépenses'],
  creator: {
    '@type': 'GovernmentOrganization',
    name: 'Ministère des Finances et du Budget du Sénégal',
  },
  publisher: {
    '@type': 'Organization',
    name: siteName,
  },
  datePublished: new Date().toISOString().split('T')[0],
  dateModified: new Date().toISOString().split('T')[0],
  license: 'https://creativecommons.org/licenses/by/4.0/',
  isAccessibleForFree: true,
  inLanguage: 'fr-SN',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Budget',
      item: url,
    },
  ],
};

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: image,
  ogUrl: url,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  keywords: [
    ...keywords,
    'Budget Sénégal',
    'loi de finances Sénégal',
    'finances publiques Sénégal',
    'recettes État Sénégal',
    'dépenses gouvernement Sénégal',
  ].join(', '),
});

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: 'Ministère des Finances et du Budget du Sénégal' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
    { name: 'robots', content: 'index, follow' },
    { name: 'geo.region', content: 'SN' },
    { name: 'geo.placename', content: 'Dakar' },
    { name: 'DC.type', content: 'Dataset' },
    { name: 'DC.format', content: 'text/html' },
    { name: 'DC.language', content: 'fr-SN' },
    { name: 'DC.coverage', content: 'Sénégal' },
    { name: 'DC.subject', content: 'Budget public, Finances, Gouvernement' },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(budgetSchema),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(datasetSchema),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbSchema),
    },
  ],
});

// Utilisation du composable useBudget
const {
  loading,
  error,
  formattedKeyIndicators,
  revenueChartData,
  revenueTotalWithVariation,
  expenseChartData,
  expenseTotalWithVariation,
  treasuryOperations,
  publicDebt,
  documents,
  revenueEvolution,
  expenseEvolution,
  financingEvolution,
  debtEvolution,
  year,
  version,
  availableYears,
  availableVersions,
  currentVersionLabel,
  setYear,
  setVersion,
  compareYear,
  hasComparison,
  comparisonYearLabel,
  setCompareYear,
} = useBudget();

// Fonction helper pour trouver une version par son label (PLF/LFI/LFR)
const getVersionByLabel = (label: string) => {
  return availableVersions.value.find((v) => v.label === label);
};

// Gestion du changement de version
const handleVersionChange = (versionId: number) => {
  setVersion(versionId);
};

// Computed pour savoir si les données sont prêtes
const isDataReady = computed(() => {
  return !loading.value && !error.value;
});

// Gestion des onglets - persiste lors des changements de filtres
const activeTab = ref('overview');

// Sauvegarder le tab actif dans sessionStorage pour le préserver
if (import.meta.client) {
  const savedTab = sessionStorage.getItem('budget-active-tab');
  if (savedTab) {
    activeTab.value = savedTab;
  }
}

// Watcher pour sauvegarder le tab actif
watch(activeTab, (newTab) => {
  if (import.meta.client) {
    sessionStorage.setItem('budget-active-tab', newTab);
  }
});
</script>

<template>
  <div class="container mx-auto py-2 pb-10 md:px-8">
    <div class="mb-2">
      <NuxtLink to="/" class="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
        <UIcon name="i-heroicons-arrow-left" class="mr-2 h-5 w-5" />
        Retour
      </NuxtLink>
    </div>

    <div class="prose prose-sm mx-auto my-2 sm:prose">
      <h1 class="text-center dark:text-white">Budget du Sénégal</h1>
    </div>

    <!-- Filtres année et version -->
    <div class="mb-6 space-y-3">
      <!-- Sélection année courante et version -->
      <div class="flex items-center justify-center gap-2">
        <!-- Select Année -->
        <USelect
          id="year-select"
          v-model="year"
          :options="availableYears.map((y) => ({ label: y.year.toString(), value: y.year }))"
          value-attribute="value"
          option-attribute="label"
          size="sm"
          class="w-28"
          :disabled="availableYears.length === 0"
        />

        <!-- Boutons Version (PLF/LFI/LFR) -->
        <button
          v-for="versionLabel in ['PLF', 'LFI', 'LFR']"
          :key="versionLabel"
          :disabled="!getVersionByLabel(versionLabel)"
          :class="[
            'custom-shadow p-1 text-sm font-medium transition-all',
            getVersionByLabel(versionLabel) && version === getVersionByLabel(versionLabel)?.id
              ? 'border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-950 dark:text-primary-300 border-2'
              : getVersionByLabel(versionLabel)
                ? 'border-1 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                : 'border-1 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-600',
          ]"
          @click="
            getVersionByLabel(versionLabel) &&
            handleVersionChange(getVersionByLabel(versionLabel)!.id)
          "
        >
          {{ versionLabel }}
        </button>
      </div>

      <!-- Section comparaison (optionnelle) -->
      <div v-if="hasComparison" class="flex flex-wrap items-center justify-center gap-2 text-sm">
        <span class="text-gray-600 dark:text-gray-400"> Évolutions par rapport à </span>
        <USelect
          v-model="compareYear"
          :options="
            availableYears
              .filter((y) => y.year < year)
              .map((y) => ({ label: `${y.year}`, value: y.year }))
          "
          value-attribute="value"
          option-attribute="label"
          size="sm"
          class="w-24"
          @update:model-value="setCompareYear"
        />
        <!-- <span class="text-gray-600 dark:text-gray-400">
          ({{ currentVersionLabel }})
        </span> -->
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="text-center">
        <div
          class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span
            class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
            >Chargement...</span
          >
        </div>
        <p class="mt-4 text-gray-600">Chargement des données budgétaires...</p>
      </div>
    </div>

    <!-- Erreur -->
    <UAlert
      v-else-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      title="Erreur de chargement"
      description="Impossible de charger les données budgétaires. Veuillez réessayer plus tard."
    />

    <!-- Contenu principal -->
    <div v-else-if="isDataReady">
      <!-- Boutons de navigation (style tabs) -->
      <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-center gap-1">
          <button
            @click="activeTab = 'overview'"
            :class="[
              'px-1 text-sm font-medium transition-colors sm:px-4 sm:py-2',
              activeTab === 'overview'
                ? 'border-b-2 border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
            ]"
          >
            Résumé
          </button>
          <button
            @click="activeTab = 'ministries'"
            :class="[
              'px-1 py-2 text-sm font-medium transition-colors sm:px-4',
              activeTab === 'ministries'
                ? 'border-b-2 border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
            ]"
          >
            Ministères
          </button>
          <button
            @click="activeTab = 'institutions'"
            :class="[
              'px-1 py-2 text-sm font-medium transition-colors sm:px-4',
              activeTab === 'institutions'
                ? 'border-b-2 border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
            ]"
          >
            Institutions
          </button>
          <button
            @click="activeTab = 'documents'"
            :class="[
              'px-1 py-2 text-sm font-medium transition-colors sm:px-4',
              activeTab === 'documents'
                ? 'border-b-2 border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
            ]"
          >
            Documents
          </button>
        </div>
      </div>

      <!-- Contenu des onglets -->
      <div>
        <!-- Vue d'ensemble -->
        <div v-show="activeTab === 'overview'">
          <div class="space-y-6">
            <!-- KPIs dans une grille responsive -->
            <div class="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <BudgetBudget2OverviewCard
                v-for="indicator in formattedKeyIndicators"
                :key="indicator.name"
                :name="indicator.name"
                :value="indicator.value"
                :unit="indicator.unit"
                :variation_percentage="indicator.variation_percentage"
                :variation_color="indicator.variation_color"
                :show-variation-badge="indicator.showVariationBadge"
                :color="indicator.color"
              />
            </div>

            <!-- Répartition recettes -->
            <div
              v-if="revenueChartData.length > 0"
              class="rounded-xl bg-white p-2 shadow-xl sm:p-6 dark:bg-gray-800"
            >
              <h2 class="mb-4 text-center text-xl font-bold text-gray-900 dark:text-white">
                Répartition des Recettes
              </h2>

              <!-- Total des recettes en grand -->
              <div class="mb-6 text-center">
                <div class="flex items-baseline justify-center gap-2">
                  <div class="text-4xl font-bold text-green-600">
                    {{ Math.round(revenueTotalWithVariation.total) }}
                    <span class="text-2xl">Mrd FCFA</span>
                  </div>
                  <UBadge
                    v-if="revenueTotalWithVariation.variation_percentage !== 'N/A'"
                    variant="solid"
                    class="rounded-full border-none bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {{ revenueTotalWithVariation.variation_percentage }}
                  </UBadge>
                </div>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Montant total des recettes du budget général
                </p>
              </div>

              <BudgetBudget2TableRevenueExpense
                :budget-data="revenueChartData"
                title=""
                color="green"
              />
            </div>

            <!-- Évolution des Recettes -->
            <BudgetEvolutionLineChart
              v-if="revenueEvolution.length > 0"
              :data="revenueEvolution"
              title="Évolution des recettes par année"
              color="green"
            />

            <!-- Répartition Dépenses -->
            <div
              v-if="expenseChartData.length > 0"
              class="rounded-xl bg-white p-2 shadow-sm sm:p-6 dark:bg-gray-800"
            >
              <h2 class="mb-4 text-center text-xl font-bold text-gray-900 dark:text-white">
                Répartition des Dépenses
              </h2>

              <!-- Total des dépenses en grand -->
              <div class="mb-6 text-center">
                <div class="flex items-baseline justify-center gap-2">
                  <div class="text-4xl font-bold text-red-600">
                    {{ Math.round(expenseTotalWithVariation.total) }}
                    <span class="text-2xl">Mrd FCFA</span>
                  </div>
                  <UBadge
                    v-if="expenseTotalWithVariation.variation_percentage !== 'N/A'"
                    variant="solid"
                    class="rounded-full border-none bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {{ expenseTotalWithVariation.variation_percentage }}
                  </UBadge>
                </div>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Montant total des dépenses du budget général
                </p>
              </div>

              <BudgetBudget2TableRevenueExpense
                :budget-data="expenseChartData"
                title=""
                color="red"
              />
            </div>

            <!-- Évolution des Dépenses -->
            <BudgetEvolutionLineChart
              v-if="expenseEvolution.length > 0"
              :data="expenseEvolution"
              title="Évolution des dépenses par année"
              color="red"
            />

            <!-- Opérations de trésorerie (Besoins de financement) -->
            <div
              v-if="treasuryOperations.components.length > 0"
              class="rounded-xl bg-white p-2 shadow-sm sm:p-6 dark:bg-gray-800"
            >
              <h2 class="mb-4 text-center text-xl font-bold text-gray-900 dark:text-white">
                Besoins de financement
              </h2>

              <!-- Total des besoins de financement en grand -->
              <div class="mb-6 text-center">
                <div class="flex items-baseline justify-center gap-2">
                  <div class="text-4xl font-bold text-purple-600">
                    {{ Math.round(treasuryOperations.total) }}
                    <span class="text-2xl">Mrd FCFA</span>
                  </div>
                  <UBadge
                    v-if="treasuryOperations.variation_percentage !== 'N/A'"
                    variant="solid"
                    class="rounded-full border-none bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {{ treasuryOperations.variation_percentage }}
                  </UBadge>
                </div>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Montant total à mobiliser pour couvrir les besoins de financement
                </p>
              </div>

              <!-- Répartition en cercles -->
              <div class="mb-4 flex flex-wrap justify-center gap-2">
                <BudgetRessourcesCircleProgress
                  v-for="component in treasuryOperations.components"
                  :key="component.label"
                  :percentage="component.percentage"
                  :label="component.label"
                  :value="`${component.value.toFixed(1)} Mrd`"
                  color-bg="#5924b2"
                  color-text="purple"
                />
              </div>
              <BudgetBudget2TableRevenueExpense
                :budget-data="treasuryOperations.components"
                title=""
                color="purple"
              />
            </div>

            <!-- Évolution des Besoins de financement -->
            <BudgetEvolutionLineChart
              v-if="financingEvolution.length > 0"
              :data="financingEvolution"
              title="Évolution des besoins de financement par année"
              color="purple"
            />

            <!-- Dette publique -->
            <div
              v-if="publicDebt.components.length > 0"
              class="rounded-xl bg-white p-2 shadow-sm sm:p-6 dark:bg-gray-800"
            >
              <h2 class="mb-4 text-center text-xl font-bold text-gray-900 dark:text-white">
                Service de la Dette publique
              </h2>

              <!-- Total de la dette en grand -->
              <div class="mb-6 text-center">
                <div class="flex items-baseline justify-center gap-2">
                  <div class="text-4xl font-bold text-orange-600">
                    {{ Math.round(publicDebt.total) }} <span class="text-2xl">Mrd FCFA</span>
                  </div>
                  <UBadge
                    v-if="publicDebt.variation_percentage !== 'N/A'"
                    variant="solid"
                    class="rounded-full border-none bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {{ publicDebt.variation_percentage }}
                  </UBadge>
                </div>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Montant total du service de la dette (intérêts + capital)
                </p>
              </div>

              <!-- Répartition en cercles -->
              <div class="mb-4 flex flex-wrap justify-center gap-6">
                <BudgetRessourcesCircleProgress
                  v-for="component in publicDebt.components"
                  :key="component.label"
                  :percentage="component.percentage"
                  :label="component.label"
                  :value="`${component.value.toFixed(1)} Mrd`"
                  color-bg="#f97316"
                  color-text="yellow"
                />
              </div>
              <BudgetBudget2TableRevenueExpense
                :budget-data="publicDebt.components"
                title=""
                color="orange"
              />
            </div>

            <!-- Évolution du Service de la dette -->
            <BudgetEvolutionLineChart
              v-if="debtEvolution.length > 0"
              :data="debtEvolution"
              title="Évolution du service de la dette par année"
              color="orange"
            />
          </div>
        </div>

        <!-- Ministères -->
        <div v-show="activeTab === 'ministries'">
          <div class="rounded-xl bg-white p-2 shadow-sm sm:p-6 dark:bg-gray-800">
            <h2 class="mb-4 text-center text-xl font-bold text-gray-900 dark:text-white">
              Budgets des Ministères {{ year }}
            </h2>
            <MinistryTable :year="year" :version="version" level="ministry" />
          </div>
        </div>

        <!-- Institutions -->
        <div v-show="activeTab === 'institutions'">
          <div class="rounded-xl bg-white p-2 shadow-sm sm:p-6 dark:bg-gray-800">
            <h2 class="mb-4 text-center text-xl font-bold text-gray-900 dark:text-white">
              Budgets des Institutions {{ year }}
            </h2>
            <MinistryTable :year="year" :version="version" level="institution" />
          </div>
        </div>

        <!-- Documents -->
        <div v-show="activeTab === 'documents'">
          <div class="p-4">
            <!-- Message si aucun document -->
            <div v-if="documents.length === 0" class="py-12 text-center">
              <UIcon name="i-heroicons-document" class="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <p class="text-gray-600 dark:text-gray-400">
                Aucun document disponible pour cette année budgétaire
              </p>
            </div>

            <!-- Grille de documents -->
            <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <NuxtLink
                v-for="document in documents"
                :key="document.id"
                :to="`/documents/${document.id}/${document.slug}`"
                class="group block overflow-hidden rounded-lg border border-gray-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700"
              >
                <!-- Image de couverture -->
                <div class="aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <CmsImage
                    v-if="document.cover_image"
                    :src="document.cover_image"
                    :alt="`Couverture ${document.title}`"
                    class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                    :quality="60"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center">
                    <UIcon name="i-heroicons-document-text" class="h-16 w-16 text-gray-400" />
                  </div>
                </div>

                <!-- Titre du document -->
                <div class="p-3">
                  <h3 class="line-clamp-2 text-sm font-medium text-gray-900 dark:text-white">
                    {{ document.title }}
                  </h3>
                  <div
                    v-if="document.file"
                    class="mt-2 flex items-center gap-1 text-xs text-gray-500"
                  >
                    <UIcon name="i-heroicons-document" class="h-3 w-3" />
                    PDF
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.custom-shadow {
  transition: all 0.3s ease;
}

.custom-shadow:hover {
  transform: translateY(-5px);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
