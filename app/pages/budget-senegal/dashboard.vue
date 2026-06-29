<script setup lang="ts">
const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const title = "Budget de l'État du Sénégal | Loi de finances";
const description =
  "Découvrez le budget de l'État du Sénégal. Répartition des recettes et dépenses, indicateurs clés, dette publique et besoins de financement.";
const url = `${siteUrl}/budget-senegal/dashboard`;
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
    '@type': 'Organization',
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
      innerHTML: JSON.stringify(budgetSchema),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(datasetSchema),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(breadcrumbSchema),
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
  compareVersion,
  hasComparison,
  comparisonYearLabel,
  setCompareYear,
} = useBudget();

// Computed pour créer une liste combinée année + version pour le select unique
const yearVersionOptions = computed(() => {
  const options: Array<{
    label: string;
    value: string;
    year: number;
    versionId: number;
    date: string;
  }> = [];

  availableYears.value.forEach((yearData) => {
    yearData.versions.forEach((ver) => {
      options.push({
        label: `${yearData.year} - ${ver.label}`,
        value: `${yearData.year}-${ver.id}`,
        year: yearData.year,
        versionId: ver.id,
        date: ver.date,
      });
    });
  });

  return options.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
});

// Computed pour la valeur sélectionnée actuelle
const selectedYearVersion = computed(() => `${year.value}-${version.value}`);

// Gestion du changement de sélection
const handleYearVersionChange = (value: string) => {
  const option = yearVersionOptions.value.find((opt) => opt.value === value);
  if (option) {
    year.value = option.year;
    version.value = option.versionId;
    compareYear.value = undefined;
    compareVersion.value = undefined;
  }
};

// Options pour le select de comparaison
const compareYearVersionOptions = computed(() => {
  const currentOption = yearVersionOptions.value.find(
    (opt) => opt.year === year.value && opt.versionId === version.value,
  );

  if (!currentOption) return [];

  const currentDate = new Date(currentOption.date);

  return yearVersionOptions.value.filter((opt) => {
    if (opt.versionId === version.value && opt.year === year.value) return false;
    const optionDate = new Date(opt.date);
    return optionDate < currentDate;
  });
});

// Computed pour la valeur sélectionnée de comparaison
const selectedCompareYearVersion = computed(() => {
  if (!compareYear.value || !compareVersion.value) return '';
  const key = `${compareYear.value}-${compareVersion.value}`;
  const exists = compareYearVersionOptions.value.some((opt) => opt.value === key);
  return exists ? key : '';
});

// Gestion du changement de comparaison
const handleCompareYearVersionChange = (value: string) => {
  const option = yearVersionOptions.value.find((opt) => opt.value === value);
  if (option) {
    setCompareYear(option.year, option.versionId);
  }
};

// Fonction pour initialiser la comparaison par défaut
const initializeDefaultComparison = () => {
  const options = compareYearVersionOptions.value;
  if (options.length === 0) return;

  const currentCompareKey =
    compareYear.value && compareVersion.value ? `${compareYear.value}-${compareVersion.value}` : '';
  const isCurrentValid =
    currentCompareKey && options.some((opt) => opt.value === currentCompareKey);

  if (!isCurrentValid) {
    const defaultCompare = options[0];
    if (defaultCompare) {
      setCompareYear(defaultCompare.year, defaultCompare.versionId);
    }
  }
};

onMounted(() => {
  nextTick(() => {
    initializeDefaultComparison();
  });
});

watch(
  () => compareYearVersionOptions.value,
  () => {
    nextTick(() => {
      initializeDefaultComparison();
    });
  },
  { deep: true },
);

const isDataReady = computed(() => {
  return !loading.value && !error.value;
});

// Gestion des onglets
const activeTab = ref('overview');

const tabs = [
  { id: 'overview', label: 'Résumé', icon: 'i-heroicons-chart-pie' },
  { id: 'ministries', label: 'Ministères', icon: 'i-heroicons-building-office-2' },
  { id: 'institutions', label: 'Institutions', icon: 'i-heroicons-building-library' },
  { id: 'documents', label: 'Documents', icon: 'i-heroicons-document-text' },
];

onMounted(() => {
  const savedTab = sessionStorage.getItem('budget-active-tab');
  if (savedTab) {
    activeTab.value = savedTab;
  }
});

watch(activeTab, (newTab) => {
  if (import.meta.client) {
    sessionStorage.setItem('budget-active-tab', newTab);
  }
});
</script>

<template>
  <div class="min-h-screen pb-16">
    <!-- Hero Header -->
    <div class="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div class="container mx-auto px-4 py-6 sm:py-8">
        <AppBreadcrumb
          :items="[
            { label: 'Budget', to: '/budget-senegal' },
            { label: 'Dashboard' }
          ]"
          class="mb-4"
        />

        <!-- Title -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
              Budget du Sénégal
            </h1>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Explorez les finances publiques en détail
            </p>
          </div>

          <!-- Filters -->
          <div class="flex items-center gap-1.5 sm:gap-3">
            <USelect
              :model-value="selectedYearVersion"
              :options="yearVersionOptions"
              value-attribute="value"
              option-attribute="label"
              size="xs"
              class="w-[130px] sm:w-44"
              :disabled="yearVersionOptions.length === 0"
              @update:model-value="handleYearVersionChange"
            />
            <span class="text-[10px] font-medium text-gray-400 sm:text-xs">vs</span>
            <USelect
              :model-value="selectedCompareYearVersion"
              :options="compareYearVersionOptions"
              value-attribute="value"
              option-attribute="label"
              size="xs"
              class="w-[130px] sm:w-44"
              placeholder="Comparer..."
              :disabled="compareYearVersionOptions.length === 0"
              @update:model-value="handleCompareYearVersionChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95">
      <div class="container mx-auto px-4">
        <nav class="-mb-px flex gap-0.5 py-1 sm:gap-2" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'group flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all sm:gap-2 sm:px-4 sm:py-2 sm:text-sm',
              activeTab === tab.id
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
            ]"
            @click="activeTab = tab.id"
          >
            <UIcon
              :name="tab.icon"
              :class="[
                'h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors',
                activeTab === tab.id
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300',
              ]"
            />
            <span>{{ tab.label }}</span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-6">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="relative h-12 w-12">
          <div class="absolute inset-0 animate-ping rounded-full bg-primary-200 opacity-75"></div>
          <div class="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <UIcon name="i-heroicons-chart-bar" class="h-6 w-6 animate-pulse text-primary-600" />
          </div>
        </div>
        <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">Chargement des données...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="mx-auto max-w-md py-12">
        <div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <UIcon name="i-heroicons-exclamation-triangle" class="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 class="text-lg font-semibold text-red-900 dark:text-red-200">Erreur de chargement</h3>
          <p class="mt-2 text-sm text-red-700 dark:text-red-300">
            Impossible de charger les données budgétaires. Veuillez réessayer.
          </p>
          <button
            class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            @click="$router.go(0)"
          >
            Réessayer
          </button>
        </div>
      </div>

      <!-- Content -->
      <div v-else-if="isDataReady">
        <!-- Overview Tab -->
        <div v-show="activeTab === 'overview'" class="space-y-6">
          <!-- KPIs Grid -->
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

          <!-- Revenue Section -->
          <section
            v-if="revenueChartData.length > 0"
            class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800/50"
          >
            <div class="border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-transparent p-4 sm:p-6 dark:border-gray-700 dark:from-emerald-900/20">
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 class="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
                    Répartition des Recettes
                  </h2>
                  <div class="flex items-baseline gap-2">
                    <span class="text-2xl font-bold text-emerald-600 sm:text-3xl dark:text-emerald-400">
                      {{ Math.round(revenueTotalWithVariation.total) }}
                    </span>
                    <span class="text-sm text-gray-500">Mrd FCFA</span>
                    <UBadge
                      v-if="revenueTotalWithVariation.variation_percentage !== 'N/A'"
                      color="gray"
                      variant="subtle"
                      size="xs"
                    >
                      {{ revenueTotalWithVariation.variation_percentage }}
                    </UBadge>
                  </div>
                </div>
                <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  Les recettes représentent l'ensemble des ressources financières collectées par
                  l'État, principalement à travers les impôts et taxes (recettes fiscales), les
                  revenus de ses activités et services (recettes non fiscales), ainsi que les dons
                  et subventions reçus des partenaires internationaux.
                </p>
              </div>
            </div>
            <div class="p-4 sm:p-6">
              <BudgetBudget2TableRevenueExpense :budget-data="revenueChartData" title="" color="green" />
            </div>
          </section>

          <!-- Revenue Evolution Chart -->
          <BudgetEvolutionLineChart
            v-if="revenueEvolution.length > 0"
            :data="revenueEvolution"
            title="Évolution des recettes par année"
            color="green"
          />

          <!-- Expense Section -->
          <section
            v-if="expenseChartData.length > 0"
            class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800/50"
          >
            <div class="border-b border-gray-200 bg-gradient-to-r from-amber-50 to-transparent p-4 sm:p-6 dark:border-gray-700 dark:from-amber-900/20">
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 class="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
                    Répartition des Dépenses
                  </h2>
                  <div class="flex items-baseline gap-2">
                    <span class="text-2xl font-bold text-amber-600 sm:text-3xl dark:text-amber-400">
                      {{ Math.round(expenseTotalWithVariation.total) }}
                    </span>
                    <span class="text-sm text-gray-500">Mrd FCFA</span>
                    <UBadge
                      v-if="expenseTotalWithVariation.variation_percentage !== 'N/A'"
                      color="gray"
                      variant="subtle"
                      size="xs"
                    >
                      {{ expenseTotalWithVariation.variation_percentage }}
                    </UBadge>
                  </div>
                </div>
                <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  Les dépenses publiques regroupent toutes les dépenses de l'État : les dépenses
                  courantes (salaires des fonctionnaires, achats de biens et services, subventions,
                  intérêts de la dette), les investissements publics (infrastructures, équipements)
                  et les dépenses en capital pour le développement du pays.
                </p>
              </div>
            </div>
            <div class="p-4 sm:p-6">
              <BudgetBudget2TableRevenueExpense :budget-data="expenseChartData" title="" color="yellow" />
            </div>
          </section>

          <!-- Expense Evolution Chart -->
          <BudgetEvolutionLineChart
            v-if="expenseEvolution.length > 0"
            :data="expenseEvolution"
            title="Évolution des dépenses par année"
            color="yellow"
          />

          <!-- Treasury Operations Section -->
          <section
            v-if="treasuryOperations.components.length > 0"
            class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800/50"
          >
            <div class="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-transparent p-4 sm:p-6 dark:border-gray-700 dark:from-purple-900/20">
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 class="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
                    Besoins de financement
                  </h2>
                  <div class="flex items-baseline gap-2">
                    <span class="text-2xl font-bold text-purple-600 sm:text-3xl dark:text-purple-400">
                      {{ Math.round(treasuryOperations.total) }}
                    </span>
                    <span class="text-sm text-gray-500">Mrd FCFA</span>
                    <UBadge
                      v-if="treasuryOperations.variation_percentage !== 'N/A'"
                      color="gray"
                      variant="subtle"
                      size="xs"
                    >
                      {{ treasuryOperations.variation_percentage }}
                    </UBadge>
                  </div>
                </div>
                <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  Les besoins de financement correspondent à l'écart entre les dépenses totales et
                  les recettes de l'État (déficit budgétaire), que le gouvernement doit combler en
                  empruntant sur les marchés financiers nationaux et internationaux, ou en
                  mobilisant des ressources exceptionnelles.
                </p>
              </div>
            </div>
            <div class="p-4 sm:p-6">
              <div class="mb-6 flex flex-wrap justify-center gap-4">
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
              <BudgetBudget2TableRevenueExpense :budget-data="treasuryOperations.components" title="" color="purple" />
            </div>
          </section>

          <!-- Financing Evolution Chart -->
          <BudgetEvolutionLineChart
            v-if="financingEvolution.length > 0"
            :data="financingEvolution"
            title="Évolution des besoins de financement par année"
            color="purple"
          />

          <!-- Public Debt Section -->
          <section
            v-if="publicDebt.components.length > 0"
            class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800/50"
          >
            <div class="border-b border-gray-200 bg-gradient-to-r from-orange-50 to-transparent p-4 sm:p-6 dark:border-gray-700 dark:from-orange-900/20">
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 class="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
                    Service de la Dette publique
                  </h2>
                  <div class="flex items-baseline gap-2">
                    <span class="text-2xl font-bold text-orange-600 sm:text-3xl dark:text-orange-400">
                      {{ Math.round(publicDebt.total) }}
                    </span>
                    <span class="text-sm text-gray-500">Mrd FCFA</span>
                    <UBadge
                      v-if="publicDebt.variation_percentage !== 'N/A'"
                      color="gray"
                      variant="subtle"
                      size="xs"
                    >
                      {{ publicDebt.variation_percentage }}
                    </UBadge>
                  </div>
                </div>
                <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  Le service de la dette représente les montants que l'État doit payer chaque année
                  pour honorer ses engagements financiers : le remboursement du capital emprunté
                  (amortissement) et le paiement des intérêts sur les emprunts contractés auprès des
                  créanciers nationaux et internationaux.
                </p>
              </div>
            </div>
            <div class="p-4 sm:p-6">
              <div class="mb-6 flex flex-wrap justify-center gap-6">
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
              <BudgetBudget2TableRevenueExpense :budget-data="publicDebt.components" title="" color="orange" />
            </div>
          </section>

          <!-- Debt Evolution Chart -->
          <BudgetEvolutionLineChart
            v-if="debtEvolution.length > 0"
            :data="debtEvolution"
            title="Évolution du service de la dette par année"
            color="orange"
          />
        </div>

        <!-- Ministries Tab -->
        <div v-show="activeTab === 'ministries'">
          <section class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800/50">
            <div class="border-b border-gray-200 p-4 sm:p-6 dark:border-gray-700">
              <h2 class="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
                Budgets des Ministères {{ year }}
              </h2>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Répartition des allocations budgétaires par ministère
              </p>
            </div>
            <div class="p-4 sm:p-6">
              <MinistryTable
                :year="year"
                :version="version"
                :compare-year="compareYear"
                :compare-version="compareVersion"
                level="ministry"
              />
            </div>
          </section>
        </div>

        <!-- Institutions Tab -->
        <div v-show="activeTab === 'institutions'">
          <section class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800/50">
            <div class="border-b border-gray-200 p-4 sm:p-6 dark:border-gray-700">
              <h2 class="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
                Budgets des Institutions {{ year }}
              </h2>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Allocations pour les institutions de la République
              </p>
            </div>
            <div class="p-4 sm:p-6">
              <MinistryTable
                :year="year"
                :version="version"
                :compare-year="compareYear"
                :compare-version="compareVersion"
                level="institution"
              />
            </div>
          </section>
        </div>

        <!-- Documents Tab -->
        <div v-show="activeTab === 'documents'">
          <!-- Empty State -->
          <div v-if="documents.length === 0" class="py-16 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <UIcon name="i-heroicons-document-text" class="h-8 w-8 text-gray-400" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Aucun document</h3>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Aucun document disponible pour cette année budgétaire
            </p>
          </div>

          <!-- Documents Grid -->
          <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <NuxtLink
              v-for="document in documents"
              :key="document.id"
              :to="`/documents/${document.id}/${document.slug}`"
              class="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-primary-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-600"
            >
              <div class="aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-900">
                <CmsImage
                  v-if="document.cover_image"
                  :src="document.cover_image"
                  :alt="`Couverture ${document.title}`"
                  class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  :quality="50"
                />
                <div v-else class="flex h-full w-full items-center justify-center">
                  <UIcon name="i-heroicons-document-text" class="h-12 w-12 text-gray-300 dark:text-gray-600" />
                </div>
              </div>
              <div class="p-3">
                <p class="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                  {{ document.title }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
