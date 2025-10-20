<script setup>
import * as d3 from "d3";
import budgetData from "@/assets/data/budget/budget-2025-plf.json";
import Budget2TableMinistry from "~/components/Budget/Budget2TableMinistry.vue";
import Budget2TableRevenueExpense from "~/components/Budget/Budget2TableRevenueExpense.vue";

const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const title = "Budget de l'État du Sénégal 2025 | Loi de finances";
const description = "Découvrez le budget 2025 de l'État du Sénégal. Projet de loi de finances, répartition des recettes et dépenses, budgets ministériels et institutions.";
const url = `${siteUrl}/budget-senegal`;
const image = `${siteUrl}/images/vpsn-share-budget.png`;

const budgetSchema = {
  "@context": "https://schema.org",
  "@type": "GovernmentService",
  "name": "Budget de l'État du Sénégal 2025",
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
  "name": "Données budgétaires Sénégal 2025",
  "description": "Jeu de données complet du budget de l'État sénégalais pour 2025 incluant recettes, dépenses et allocations ministérielles",
  "url": url,
  "keywords": ["budget", "finances publiques", "Sénégal", "2025", "ministères", "recettes", "dépenses"],
  "creator": {
    "@type": "GovernmentOrganization",
    "name": "Ministère des Finances et du Budget du Sénégal",
  },
  "publisher": {
    "@type": "Organization",
    "name": siteName,
  },
  "datePublished": "2025-01-02",
  "dateModified": "2025-01-02",
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
      "name": "Budget Sénégal",
      "item": url,
    },
  ],
};

const financialProductSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": "Loi de finances 2025 Sénégal",
  "description": "Projet de loi de finances de l'État du Sénégal pour l'exercice 2025",
  "url": url,
  "provider": {
    "@type": "GovernmentOrganization",
    "name": "Assemblée nationale du Sénégal",
  },
  "feesAndCommissionsSpecification": "Transparent - Données publiques gratuites",
  "category": "Public Finance",
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
    "Budget Sénégal 2025",
    "loi de finances Sénégal",
    "LFI Sénégal",
    "finances publiques Sénégal",
    "recettes État Sénégal",
    "dépenses gouvernement Sénégal",
    "budget ministères Sénégal",
    "institutions budgétaires",
  ].join(", "),
});

// Head Configuration
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
    { name: "geo.position", content: "14.7645042;-17.3660286" },
    { name: "ICBM", content: "14.7645042, -17.3660286" },
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
    {
      type: "application/ld+json",
      children: JSON.stringify(financialProductSchema),
    },
  ],
});

const budget = ref(budgetData);

onMounted(async () => {
  createCharts();
});

const createCharts = () => {
  createPieChart(
    "#revenueChart",
    budget.value.revenueData,
    "Répartition des recettes",
  );
  createPieChart(
    "#expenseChart",
    budget.value.expenseData,
    "Répartition des dépenses",
  );
};

const createPieChart = (selector, data, title) => {
  const width = 400;
  const height = 400;
  const radius = Math.min(width, height) / 2;
  const margin = 40;

  const color = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.label))
    .range(["#60A5FA", "#34D399", "#F472B6", "#FBBF24"]);

  const pie = d3
    .pie()
    .value((d) => d.value)
    .sort(null);

  const arc = d3
    .arc()
    .innerRadius(radius * 0.4)
    .outerRadius(radius - margin);

  // Supprime le graphique existant s'il y en a un
  d3.select(selector).selectAll("*").remove();

  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Ajoute les segments
  const g = svg.selectAll("arc").data(pie(data)).enter().append("g");

  g.append("path")
    .attr("d", arc)
    .style("fill", (d) => color(d.data.label))
    .style("opacity", 0.8)
    .style("stroke", "white")
    .style("stroke-width", 2);

  // Ajoute les étiquettes
  const label = g
    .append("text")
    .attr("transform", (d) => {
      const pos = arc.centroid(d);
      const x = pos[0] * 1.5;
      const y = pos[1] * 1.5;
      return `translate(${x},${y})`;
    })
    .attr("dy", ".35em")
    .style("text-anchor", "middle")
    .style("font-size", "12px");

  label
    .append("tspan")
    .text((d) => d.data.label)
    .attr("x", 0)
    .attr("dy", "0em");

  label
    .append("tspan")
    .text((d) => `${d.data.value.toLocaleString()} Mrd`)
    .attr("x", 0)
    .attr("dy", "1.2em");
};
</script>

<template>
  <div class="container mx-auto py-2 md:px-8">
    <div class="mb-2 flex flex-row justify-between space-y-0 sm:items-center">
      <NuxtLink to="/" class="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
        <UIcon name="i-heroicons-arrow-left" class="mr-2 h-5 w-5" />
        Retour
      </NuxtLink>

      <NuxtLink to="/budget-senegal/2024" class="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
        Budget 2024
        <UIcon name="i-heroicons-arrow-right" class="ml-2 h-5 w-5" />
      </NuxtLink>
    </div>

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center dark:text-white">Budget 2025</h1>
    </div>
    <div class="text-center">
      <p class="mb-2 text-sm text-gray-500">
        Projet de loi de finances - Mis à jour 02 Janv 2025
      </p>
    </div>

    <!-- Onglets -->
    <div class="rounded-xl border-none bg-white">
      <UTabs
v-if="budget" :default-index="0" :items="[
        { id: 'overview', label: 'Résumé' },
        { id: 'ministries', label: 'Ministères' },
        { id: 'institutions', label: 'Institutions' },
      ]">
        <template #item="{ item }">
          <!-- Vue d'ensemble -->
          <template v-if="item.id === 'overview'">
            <!-- KPIs dans une grille responsive -->
            <div class="grid grid-cols-2 gap-2">
              <BudgetBudget2OverviewCard
v-for="indicator in budget?.keyIndicator" :key="indicator.name"
                :name="indicator.name" :value="indicator.value" :unit="indicator.unit"
                :variation_percentage="indicator.variation_percentage" :color="indicator.color" />
            </div>
            <!-- répartition recettes -->
            <Budget2TableRevenueExpense
:budget-data="budget?.revenueData" title="Répartition des Recettes"
              color="green" />

            <!-- répartition Dépenses -->
            <Budget2TableRevenueExpense
:budget-data="budget?.expenseData" title="Répartition des Dépenses"
              color="indigo" />

            <!-- opération trésorerie -->
            <h2 class="mt-4 p-2 text-center font-bold dark:text-black">
              Opérations de trésorerie
            </h2>
            <div class="text-center">
              <p class="mb-2 text-sm text-gray-500">
                C'est l'argent que l'État doit trouver pour rembourser les
                emprunts qui arrivent à échéance.
              </p>
            </div>
            <div class="flex flex-row md:gap-4">
              <BudgetRessourcesCircleProgress
v-for="treasuryOperation in budget?.treasuryOperations
                .components" :key="treasuryOperation.label" :percentage="treasuryOperation.percentage"
                :label="treasuryOperation.label" :value="`${treasuryOperation.value} Mrd`" color-bg="#5924b2"
                color-text="purple" class="flex-1" />
            </div>
            <Budget2TableRevenueExpense :budget-data="budget?.treasuryOperations.components" title="" color="purple" />
            <!-- Dettes -->
            <h2 class="mt-4 p-2 text-center font-bold dark:text-black">
              Répartition de la Dette publique
            </h2>
            <div class="text-center">
              <p class="mb-2 text-sm text-gray-500">
                l'État devra payer au total 3855 milliards FCFA pour sa dette,
                ce qu'on appelle le 'service de la dette'. Ce montant se
                décompose en deux parties :
              </p>
            </div>
            <div class="flex flex-row md:gap-4">
              <BudgetRessourcesCircleProgress
v-for="treasuryOperation in budget?.publicDebt.components"
                :key="treasuryOperation.label" :percentage="treasuryOperation.percentage"
                :label="treasuryOperation.label" :value="`${treasuryOperation.value} Mrd`" color-bg="#f97316"
                color-text="yellow" class="flex-1" />
            </div>
            <Budget2TableRevenueExpense :budget-data="budget?.publicDebt.components" title="" color="orange" />
          </template>

          <!-- Ministères -->
          <template v-if="item.id === 'ministries'">
            <Budget2TableMinistry :ministries="budget.ministries" type="ministries" />
          </template>
          <!-- Ministères -->
          <template v-if="item.id === 'institutions'">
            <Budget2TableMinistry :ministries="budget.institutions" type="institutions" />
          </template>
        </template>
      </UTabs>

      <!-- Sources -->
      <div class="mt-6 bg-white p-4 shadow-lg">
        <h2 class="mb-2 text-lg font-semibold dark:text-black">🗂️ Sources</h2>
        <UButton
icon="i-heroicons-document-text" size="sm" color="blue" variant="solid"
          label="Voir les documents budgétaires" to="/documents/budget" :trailing="false" />
      </div>
      <div class="mt-6 border-b border-gray-200 bg-white p-4 shadow-lg dark:text-black">
        <h2 class="mb-2 text-lg font-semibold">💡 NB</h2>
        <ul class="list-disc space-y-1 pl-5">
          <li v-for="point in budget?.notes" :key="point">{{ point }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style>
.chart-container {
  position: relative;
  height: 400px;
}

/* Animations pour les cartes */
.custom-shadow {
  transition: all 0.3s ease;
}

.custom-shadow:hover {
  transform: translateY(-5px);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Styles responsives pour le tableau */
@media (max-width: 640px) {
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  td:first-child {
    max-width: 200px;
    white-space: normal;
  }
}

.bg-beige-300 {
  background-color: #d7ccc8;
}

.text-beige-500 {
  color: #a1887f;
}

.bg-beige-300 {
  background-color: #d7ccc8;
}

.bg-beige-100 {
  background-color: #efebe9;
}

.bg-blue-custom {
  background-color: #f3f4fa;
  box-shadow: 0 2px 4px #0000001a;
  border-radius: 0px;
}
</style>
