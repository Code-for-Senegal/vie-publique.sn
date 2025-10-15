<script setup>
import { ref, onMounted, watch } from "vue";
import * as d3 from "d3";

const props = defineProps({
  revenueData: {
    type: Array,
    required: true,
  },
  expenseData: {
    type: Array,
    required: true,
  },
});

const chartContainer = ref(null);

const createWaterfallChart = () => {
  // Nettoyer le conteneur
  d3.select(chartContainer.value).selectAll("*").remove();

  // Dimensions et marges
  const margin = { top: 40, right: 20, bottom: 60, left: 100 };
  const width = chartContainer.value.clientWidth - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  // Créer le SVG
  const svg = d3
    .select(chartContainer.value)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Préparer les données
  const revenueTotal = d3.sum(props.revenueData, (d) => d.value);
  const expenseTotal = d3.sum(props.expenseData, (d) => d.value);

  // Combiner recettes et dépenses
  const data = [
    {
      type: "Total Recettes",
      value: revenueTotal,
      isTotal: true,
      isRevenue: true,
    },
    ...props.revenueData.map((d) => ({ ...d, isRevenue: true })),
    {
      type: "Total Dépenses",
      value: expenseTotal,
      isTotal: true,
      isExpense: true,
    },
    ...props.expenseData.map((d) => ({ ...d, isExpense: true })),
  ];

  // Échelles
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.type))
    .range([0, width])
    .padding(0.4);

  const y = d3
    .scaleLinear()
    .domain([0, Math.max(revenueTotal, expenseTotal)])
    .range([height, 0]);

  // Axes
  const xAxis = d3.axisBottom(x).tickSize(0);

  const yAxis = d3
    .axisLeft(y)
    .ticks(10)
    .tickFormat((d) => `${d.toLocaleString()} Mds`);

  // Couleurs
  const color = (d) => {
    if (d.isTotal && d.isRevenue) return "#10B981";
    if (d.isTotal && d.isExpense) return "#EF4444";
    if (d.isRevenue) return "#34D399";
    return "#F87171";
  };

  // Dessiner les barres
  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.type))
    .attr("y", (d) => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d.value))
    .attr("fill", color)
    .attr("opacity", (d) => (d.isTotal ? 1 : 0.8));

  // Ajouter les valeurs sur les barres
  svg
    .selectAll(".label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", (d) => x(d.type) + x.bandwidth() / 2)
    .attr("y", (d) => y(d.value) - 5)
    .attr("text-anchor", "middle")
    .attr("fill", "currentColor")
    .style("font-size", "12px")
    .text((d) => {
      const percent = (
        (d.value / (d.isRevenue ? revenueTotal : expenseTotal)) *
        100
      ).toFixed(1);
      return `${d.value.toLocaleString()} (${percent}%)`;
    });

  // Ajouter les axes
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis)
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .attr("text-anchor", "end")
    .attr("dx", "-0.8em")
    .attr("dy", "0.15em");

  svg.append("g").attr("class", "y-axis").call(yAxis);

  // Ajouter un titre
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Répartition du Budget 2025");
};

// Gérer le redimensionnement
const handleResize = () => {
  if (chartContainer.value) {
    createWaterfallChart();
  }
};

onMounted(() => {
  createWaterfallChart();
  window.addEventListener("resize", handleResize);
});

watch([() => props.revenueData, () => props.expenseData], () => {
  createWaterfallChart();
});
</script>

<template>
  <div ref="chartContainer" class="min-h-[600px] w-full"></div>
</template>

<style scoped>
.bar:hover {
  opacity: 0.7;
  cursor: pointer;
}
</style>
