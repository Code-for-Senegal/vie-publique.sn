<script setup lang="ts">
const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const title = "Budget de l'État du Sénégal | Loi de finances";
const description = "Découvrez le budget de l'État du Sénégal. Répartition des recettes et dépenses, indicateurs clés, dette publique et besoins de financement.";
const url = `${siteUrl}/budget`;
const image = `${siteUrl}/images/vpsn-share-budget.png`;

const budgetSchema = {
  "@context": "https://schema.org",
  "@type": "GovernmentService",
  "name": "Budget de l'État du Sénégal",
  "description": description,
  "url": url,
  "image": image,
  "provider": {
    "@type": "GovernmentOrganization",
    "name": "Ministère des Finances et du Budget du Sénégal",
    "parentOrganization": {
      "@type": "GovernmentOrganization",
      "name": "République du Sénégal",
    },
  },
  "areaServed": {
    "@type": "Country",
    "name": "Sénégal",
  },
  "serviceType": "Budget public",
  "audience": {
    "@type": "Audience",
    "audienceType": "Citizens, Researchers, Media",
  },
};

const datasetSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Données budgétaires Sénégal",
  "description": "Jeu de données complet du budget de l'État sénégalais incluant recettes, dépenses et allocations",
  "url": url,
  "keywords": ["budget", "finances publiques", "Sénégal", "recettes", "dépenses"],
  "creator": {
    "@type": "GovernmentOrganization",
    "name": "Ministère des Finances et du Budget du Sénégal",
  },
  "publisher": {
    "@type": "Organization",
    "name": siteName,
  },
  "datePublished": new Date().toISOString().split('T')[0],
  "dateModified": new Date().toISOString().split('T')[0],
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "isAccessibleForFree": true,
  "inLanguage": "fr-SN",
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
      "name": "Budget",
      "item": url,
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
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  keywords: [
    ...keywords,
    "Budget Sénégal",
    "loi de finances Sénégal",
    "finances publiques Sénégal",
    "recettes État Sénégal",
    "dépenses gouvernement Sénégal",
  ].join(", "),
});

useHead({
  htmlAttrs: { lang: "fr-SN" },
  link: [{ rel: "canonical", href: url }],
  meta: [
    { name: "theme-color", content: themeColor },
    { name: "author", content: "Ministère des Finances et du Budget du Sénégal" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { name: "robots", content: "index, follow" },
    { name: "geo.region", content: "SN" },
    { name: "geo.placename", content: "Dakar" },
    { name: "DC.type", content: "Dataset" },
    { name: "DC.format", content: "text/html" },
    { name: "DC.language", content: "fr-SN" },
    { name: "DC.coverage", content: "Sénégal" },
    { name: "DC.subject", content: "Budget public, Finances, Gouvernement" },
  ],
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify(budgetSchema),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(datasetSchema),
    },
    {
      type: "application/ld+json",
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
  expenseChartData,
  treasuryOperations,
  publicDebt,
  documents,
  year,
  version,
  availableYears,
  availableVersions,
  currentVersionLabel,
  setYear,
  setVersion,
} = useBudget();

// Gestion du changement d'année
const handleYearChange = (newYear: number) => {
  setYear(newYear);
  // Réinitialiser la version à la première disponible pour cette année
  if (availableVersions.value.length > 0) {
    setVersion(availableVersions.value[0].id);
  }
};

// Gestion du changement de version
const handleVersionChange = (versionId: number) => {
  setVersion(versionId);
};
</script>

<template>
  <div class="container mx-auto py-2 md:px-8">
    <div class="mb-2">
      <NuxtLink to="/" class="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
        <UIcon name="i-heroicons-arrow-left" class="mr-2 h-5 w-5" />
        Retour
      </NuxtLink>
    </div>

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center dark:text-white">Budget du Sénégal</h1>
    </div>

    <!-- Filtres année et version -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
      <!-- Filtre Année -->
      <div class="flex items-center gap-2">
        <label for="year-select" class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Année :
        </label>
        <USelect
          id="year-select"
          :model-value="year"
          :options="availableYears.map(y => ({ label: y.year.toString(), value: y.year }))"
          value-attribute="value"
          option-attribute="label"
          size="md"
          class="w-32"
          @update:model-value="handleYearChange"
        />
      </div>

      <!-- Filtre Version -->
      <div class="flex items-center gap-2">
        <label for="version-select" class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Version :
        </label>
        <USelect
          id="version-select"
          :model-value="version"
          :options="availableVersions.map(v => ({ label: v.label, value: v.id }))"
          value-attribute="value"
          option-attribute="label"
          size="md"
          class="w-32"
          :disabled="availableVersions.length === 0"
          @update:model-value="handleVersionChange"
        />
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="text-center">
        <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Chargement...</span>
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
    <div v-else-if="!loading && !error" class="rounded-xl border-none bg-white">
      <UTabs
          :default-index="0"
          :items="[
            { id: 'overview', label: 'Résumé' },
            { id: 'documents', label: 'Documents' },
          ]"
        >
          <template #item="{ item }">
          <!-- Vue d'ensemble -->
          <template v-if="item.id === 'overview'">
            <!-- KPIs dans une grille responsive -->
            <div class="grid grid-cols-2 gap-2">
              <BudgetBudget2OverviewCard
                v-for="indicator in formattedKeyIndicators"
                :key="indicator.name"
                :name="indicator.name"
                :value="indicator.value"
                :unit="indicator.unit"
                :variation_percentage="indicator.variation_percentage"
                :color="indicator.color"
              />
            </div>

            <!-- Répartition recettes -->
            <Budget2TableRevenueExpense
              v-if="revenueChartData.length > 0"
              :budget-data="revenueChartData"
              title="Répartition des Recettes"
              color="green"
            />

            <!-- Répartition Dépenses -->
            <Budget2TableRevenueExpense
              v-if="expenseChartData.length > 0"
              :budget-data="expenseChartData"
              title="Répartition des Dépenses"
              color="indigo"
            />

            <!-- Opérations de trésorerie (Besoins de financement) -->
            <div v-if="treasuryOperations.components.length > 0">
              <h2 class="mt-4 p-2 text-center font-bold dark:text-black">
                Besoins de financement
              </h2>
              <div class="text-center">
                <p class="mb-2 text-sm text-gray-500">
                  C'est l'argent que l'État doit mobiliser pour couvrir ses besoins de financement.
                </p>
              </div>
              <div class="flex flex-row md:gap-4">
                <BudgetRessourcesCircleProgress
                  v-for="component in treasuryOperations.components"
                  :key="component.label"
                  :percentage="component.percentage"
                  :label="component.label"
                  :value="`${component.value.toFixed(1)} Mrd`"
                  color-bg="#5924b2"
                  color-text="purple"
                  class="flex-1"
                />
              </div>
              <Budget2TableRevenueExpense
                :budget-data="treasuryOperations.components"
                title=""
                color="purple"
              />
            </div>

            <!-- Dette publique -->
            <div v-if="publicDebt.components.length > 0">
              <h2 class="mt-4 p-2 text-center font-bold dark:text-black">
                Service de la Dette publique
              </h2>
              <div class="text-center">
                <p class="mb-2 text-sm text-gray-500">
                  Montant total que l'État devra payer pour le service de sa dette (intérêts + capital).
                </p>
              </div>
              <div class="flex flex-row md:gap-4">
                <BudgetRessourcesCircleProgress
                  v-for="component in publicDebt.components"
                  :key="component.label"
                  :percentage="component.percentage"
                  :label="component.label"
                  :value="`${component.value.toFixed(1)} Mrd`"
                  color-bg="#f97316"
                  color-text="yellow"
                  class="flex-1"
                />
              </div>
              <Budget2TableRevenueExpense
                :budget-data="publicDebt.components"
                title=""
                color="orange"
              />
            </div>
          </template>

          <!-- Onglet Documents -->
          <template v-if="item.id === 'documents'">
            <div class="p-4">
              <!-- Message si aucun document -->
              <div v-if="documents.length === 0" class="py-12 text-center">
                <UIcon name="i-heroicons-document" class="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <p class="text-gray-600 dark:text-gray-400">
                  Aucun document disponible pour cette année budgétaire
                </p>
              </div>

              <!-- Grille de documents -->
              <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
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
                    <div v-if="document.file" class="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <UIcon name="i-heroicons-document" class="h-3 w-3" />
                      PDF
                    </div>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </template>
        </template>
      </UTabs>
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
