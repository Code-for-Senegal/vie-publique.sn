<script setup>
import * as d3 from "d3";
import budgetData from "@/assets/data/budget/budget-2025-plf.json";
import Budget2TableMinistry from "~/components/Budget/Budget2TableMinistry.vue";
import Budget2TableRevenueExpense from "~/components/Budget/Budget2TableRevenueExpense.vue";

const seoTitle = "Budget l'État du Sénégal";
const seoDescription =
  "Budget 2025 de l'État du Sénégal, Loi de finance et rapport d'exécution";
const seoImgPath = "https://vie-publique.sn/images/vpsn-share-budget.png";
const seoPageUrl = "https://vie-publique.sn/budget-senegal";
useHead({
  title: seoTitle,
  meta: [
    {
      name: "description",
      content: seoDescription,
    },
    {
      name: "keywords",
      content:
        "Budget Sénégal, Budget Sénégal 2025, loi de finances Sénégal, LFI Sénégal",
    },
    // Twitter Card Meta Tags
    {
      name: "twitter:title",
      content: seoTitle,
    },
    {
      name: "twitter:description",
      content: seoDescription,
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: seoImgPath },
    // Open Graph Meta Tags
    {
      property: "og:title",
      content: seoTitle,
    },
    {
      property: "og:description",
      content: seoDescription,
    },
    { property: "og:image", content: seoImgPath },
    { property: "og:url", content: seoPageUrl },
    { property: "og:type", content: "website" },
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
      <NuxtLink
        to="/"
        class="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
      >
        <UIcon name="i-heroicons-arrow-left" class="mr-2 h-5 w-5" />
        Retour
      </NuxtLink>

      <NuxtLink
        to="/budget-senegal/2024"
        class="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
      >
        Budget 2024
        <UIcon name="i-heroicons-arrow-right" class="ml-2 h-5 w-5" />
      </NuxtLink>
    </div>

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Budget 2025</h1>
    </div>
    <div class="text-center">
      <p class="mb-2 text-sm text-gray-500">
        Projet de loi de finances - Mis à jour 02 Janv 2025
      </p>
    </div>

    <!-- Onglets -->
    <div class="rounded-xl border-none bg-white">
      <UTabs
        v-if="budget"
        :default-index="0"
        :items="[
          { id: 'overview', label: 'Résumé' },
          { id: 'ministries', label: 'Ministères' },
          { id: 'institutions', label: 'Institutions' },
        ]"
      >
        <template #item="{ item }">
          <!-- Vue d'ensemble -->
          <template v-if="item.id === 'overview'">
            <!-- KPIs dans une grille responsive -->
            <div class="grid grid-cols-2 gap-2">
              <BudgetBudget2OverviewCard
                v-for="indicator in budget?.keyIndicator"
                :key="indicator.name"
                :name="indicator.name"
                :value="indicator.value"
                :unit="indicator.unit"
                :variation_percentage="indicator.variation_percentage"
                :color="indicator.color"
              />
            </div>
            <!-- répartition recettes -->
            <Budget2TableRevenueExpense
              :budget-data="budget?.revenueData"
              title="Répartition des Recettes"
              color="green"
            />

            <!-- répartition Dépenses -->
            <Budget2TableRevenueExpense
              :budget-data="budget?.expenseData"
              title="Répartition des Dépenses"
              color="indigo"
            />

            <!-- opération trésorerie -->
            <h2 class="mt-4 p-2 text-center font-bold">
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
                  .components"
                :key="treasuryOperation.label"
                :percentage="treasuryOperation.percentage"
                :label="treasuryOperation.label"
                :value="`${treasuryOperation.value} Mrd`"
                color-bg="#5924b2"
                color-text="purple"
                class="flex-1"
              />
            </div>
            <Budget2TableRevenueExpense
              :budget-data="budget?.treasuryOperations.components"
              title=""
              color="purple"
            />
            <!-- Dettes -->
            <h2 class="mt-4 p-2 text-center font-bold">
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
                :key="treasuryOperation.label"
                :percentage="treasuryOperation.percentage"
                :label="treasuryOperation.label"
                :value="`${treasuryOperation.value} Mrd`"
                color-bg="#f97316"
                color-text="yellow"
                class="flex-1"
              />
            </div>
            <Budget2TableRevenueExpense
              :budget-data="budget?.publicDebt.components"
              title=""
              color="orange"
            />
            <!-- <div class="flex flex-col md:flex-row md:gap-2">
              <BudgetRessourcesCircleProgress
                v-for="revenue in budget.revenueData.details"
                :key="revenue.label"
                :percentage="revenue.percentage"
                :label="revenue.name"
                :value="`${resource.value} Mrd`"
                color="#4CAF50"
                class="flex-1"
              />
            </div> -->
            <!-- Ajout du graphique -->
            <!-- <div class="mt-8">
              <h3 class="mb-4 text-center font-medium">
                Répartition visuelle des Recettes
              </h3>
              <Budget2ChartsBar1
                :data="budget?.revenueData"
                title="test"
                color="green"
              />
              <Budget2ChartsPie2
                :data="budget?.revenueData"
                :width="400"
                :height="300"
              />
            </div> -->
          </template>

          <!-- Ministères -->
          <template v-if="item.id === 'ministries'">
            <Budget2TableMinistry
              :ministries="budget.ministries"
              type="ministries"
            />
          </template>
          <!-- Ministères -->
          <template v-if="item.id === 'institutions'">
            <Budget2TableMinistry
              :ministries="budget.institutions"
              type="institutions"
            />
          </template>
        </template>
      </UTabs>

      <!-- Sources -->
      <div class="mt-6 bg-white p-4 shadow-lg">
        <h2 class="mb-2 text-lg font-semibold">🗂️ Sources</h2>
        <UButton
          icon="i-heroicons-document-text"
          size="sm"
          color="blue"
          variant="solid"
          label="Voir les documents budgétaires"
          to="/documents/budget"
          :trailing="false"
        />
      </div>
      <div class="mt-6 border-b border-gray-200 bg-white p-4 shadow-lg">
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
