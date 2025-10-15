<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import * as d3 from "d3";

interface ChartData {
  label: string;
  value: number;
  variation_percentage: number;
}

interface Props {
  data: ChartData[];
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  width: 400,
  height: 400,
});

const chartRef = ref<HTMLElement | null>(null);

const createDonutChart = () => {
  if (!chartRef.value || !props.data) return;

  // Nettoyer le SVG existant
  d3.select(chartRef.value).selectAll("*").remove();

  const margin = 40;
  const radius = Math.min(props.width, props.height) / 2 - margin;

  // Couleurs
  const colors = ["#60A5FA", "#34D399", "#F472B6", "#FBBF24", "#A78BFA"];
  const color = d3
    .scaleOrdinal()
    .domain(props.data.map((d) => d.label))
    .range(colors);

  // Créer le SVG
  const svg = d3
    .select(chartRef.value)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${props.width} ${props.height}`)
    .append("g")
    .attr("transform", `translate(${props.width / 2},${props.height / 2})`);

  // Configuration du donut
  const pie = d3
    .pie<ChartData>()
    .value((d) => d.value)
    .sort(null);

  const arc = d3
    .arc()
    .innerRadius(radius * 0.6)
    .outerRadius(radius);

  // Arc pour les labels
  const labelArc = d3
    .arc()
    .innerRadius(radius * 1.1)
    .outerRadius(radius * 1.1);

  // Créer les sections du donut
  const paths = svg
    .selectAll("path")
    .data(pie(props.data))
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data.label))
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .style("opacity", 0.8)
    .on("mouseover", function () {
      d3.select(this).style("opacity", 1);
    })
    .on("mouseout", function () {
      d3.select(this).style("opacity", 0.8);
    });

  // Ajouter les labels
  const labels = svg
    .selectAll("text")
    .data(pie(props.data))
    .enter()
    .append("text")
    .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
    .style("text-anchor", "middle")
    .style("font-size", "12px");

  labels
    .append("tspan")
    .text((d) => d.data.label)
    .attr("y", "-0.6em")
    .attr("x", 0)
    .style("font-weight", "bold");

  // Ajouter les pourcentages
  labels
    .append("tspan")
    .text(
      (d) =>
        `${((d.data.value / d3.sum(props.data, (d) => d.value)) * 100).toFixed(1)}%`,
    )
    .attr("y", "1em")
    .attr("x", 0);

  // Légende
  const legend = svg
    .selectAll(".legend")
    .data(props.data)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr(
      "transform",
      (d, i) =>
        `translate(${-props.width / 2 + 20},${-props.height / 2 + 20 + i * 20})`,
    );

  legend
    .append("rect")
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", (d) => color(d.label));

  legend
    .append("text")
    .attr("x", 20)
    .attr("y", 10)
    .text(
      (d) =>
        `${d.label} (${((d.value / d3.sum(props.data, (d) => d.value)) * 100).toFixed(1)}%)`,
    );
};

// Observer les changements de données
watch(
  () => props.data,
  () => {
    createDonutChart();
  },
  { deep: true },
);

// Créer le graphique au montage
onMounted(() => {
  createDonutChart();
});
</script>

<template>
  <div class="w-full">
    <div
      ref="chartRef"
      class="flex h-full w-full items-center justify-center"
      style="min-height: 400px"
    ></div>
  </div>
</template>
